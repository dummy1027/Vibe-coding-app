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
    """점수(score) 합산 없이, 동점자 및 동일 순위 쏠림 발생 시 순수 무작위(1/N) 추첨으로 1:1 매칭을 생성합니다."""
    available = {
        member: [role for role in payload.roles if payload.edges.get(member, {}).get(role)]
        for member in payload.members
    }
    
    # 1. 팀원 순서를 순전히 운(100% 무작위)으로 섞은 후, 선택지가 적은 팀원부터 탐색
    ordered_members = list(payload.members)
    shuffle(ordered_members)
    ordered_members.sort(key=lambda member: len(available[member]))

    used_roles: set[str] = set()
    assignment: Dict[str, str] = {}

    def search(index: int) -> bool:
        if index == len(ordered_members):
            return True  # 모든 인원이 중복 없이 무사히 배정되면 즉시 성공 반환!

        member = ordered_members[index]
        ranked_roles = list(available[member])
        
        # 2. 역할 목록도 무작위로 섞은 뒤 우선순위(1~N순위) 정렬
        # 지망 순위가 같거나 겹치면 shuffle 결과에 의해 순수한 운(1/N)으로 당첨자 결정
        shuffle(ranked_roles)
        ranked_roles.sort(
            key=lambda role: payload.priorities.get(member, {}).get(role, len(payload.roles))
        )

        for role in ranked_roles:
            if role in used_roles:
                continue

            used_roles.add(role)
            assignment[member] = role

            if search(index + 1):
                return True

            # 실패 시 백트래킹 (원상복구)
            used_roles.remove(role)
            del assignment[member]

        return False

    if search(0):
        return assignment
    return None


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