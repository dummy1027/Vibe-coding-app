from pathlib import Path
from random import random, shuffle
from typing import Dict, List

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

ROOT = Path(__file__).parent

app = FastAPI(title="Matchwork", version="1.0.0")
app.mount("/static", StaticFiles(directory=ROOT), name="static")


class MatchingRequest(BaseModel):
    members: List[str] = Field(max_length=30)
    roles: List[str] = Field(max_length=30)
    edges: Dict[str, Dict[str, bool]]
    priorities: Dict[str, Dict[str, int]] = Field(default_factory=dict)


class MatchingResponse(BaseModel):
    match: Dict[str, str] | None


def find_perfect_matching(payload: MatchingRequest) -> Dict[str, str] | None:
    """Return the complete assignment with the best combined rank, if one exists."""
    available = {
        member: [role for role in payload.roles if payload.edges.get(member, {}).get(role)]
        for member in payload.members
    }
    # Preserve the fewest-options-first rule, while avoiding name-order bias on ties.
    ordered_members = list(payload.members)
    shuffle(ordered_members)
    ordered_members.sort(key=lambda member: len(available[member]))
    used_roles: set[str] = set()
    assignment: Dict[str, str] = {}
    best_assignment: Dict[str, str] | None = None
    best_score = -1

    def search(index: int, score: int) -> None:
        nonlocal best_assignment, best_score
        if index == len(ordered_members):
            if score > best_score or (score == best_score and best_assignment is not None and random() < 0.5):
                best_score = score
                best_assignment = assignment.copy()
            return
        member = ordered_members[index]
        ranked_roles = list(available[member])
        shuffle(ranked_roles)
        ranked_roles.sort(
            key=lambda role: payload.priorities.get(member, {}).get(role, len(payload.roles))
        )
        for role in ranked_roles:
            if role in used_roles:
                continue
            used_roles.add(role)
            assignment[member] = role
            rank = min(payload.priorities.get(member, {}).get(role, len(payload.roles)), len(payload.roles))
            search(index + 1, score + (len(payload.roles) + 1 - rank))
            used_roles.remove(role)
            del assignment[member]

    search(0, 0)
    return best_assignment


@app.get("/", include_in_schema=False)
def index() -> FileResponse:
    return FileResponse(ROOT / "index.html")


@app.post("/api/match", response_model=MatchingResponse)
def create_match(payload: MatchingRequest) -> MatchingResponse:
    if len(payload.members) != len(payload.roles):
        raise HTTPException(
            status_code=422,
            detail="A perfect one-to-one match requires equal numbers of members and roles.",
        )
    if len(set(payload.members)) != len(payload.members) or len(set(payload.roles)) != len(payload.roles):
        raise HTTPException(status_code=422, detail="Members and roles must be unique.")
    return MatchingResponse(match=find_perfect_matching(payload))
