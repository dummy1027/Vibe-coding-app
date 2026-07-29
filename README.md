# Matchwork - 팀 역할 매칭

이분 그래프의 완전 매칭을 이용해 팀원과 역할을 1:1로 배정하는 FastAPI 웹 앱입니다.

## 사용 방법

1. 팀원과 역할을 같은 수만큼 입력합니다.
2. 각 팀원이 맡을 수 있는 역할을 연결표에서 체크합니다.
3. `역할 배정하기`를 누르면 백트래킹 탐색으로 완전 매칭을 찾습니다.

완전 매칭이 없으면 조건을 보완해야 한다는 안내를 표시합니다. 프런트엔드는 서버가 없어도 기본 탐색을 수행하지만, FastAPI를 실행하면 검증 및 매칭 계산을 API로 처리합니다.

## 실행

```powershell
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

브라우저에서 `http://127.0.0.1:8000`을 엽니다.

## 배포

FastAPI를 지원하는 Render, Railway 등의 Python 호스팅 환경에 배포할 수 있습니다. 시작 명령은 `uvicorn main:app --host 0.0.0.0 --port $PORT`입니다.
