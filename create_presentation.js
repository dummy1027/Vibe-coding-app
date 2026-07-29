const pptxgen = require('pptxgenjs');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = '배도훈';
pptx.company = '부산광역시교육청정보영재교육원';
pptx.subject = '팀원 최적 역할 매칭 서비스 개발';
pptx.title = '팀원 최적 역할 매칭 서비스 개발';
pptx.lang = 'ko-KR';
pptx.theme = {
  headFontFace: 'Noto Sans KR',
  bodyFontFace: 'Noto Sans KR',
  lang: 'ko-KR',
};
pptx.defineLayout({ name: 'CUSTOM_WIDE', width: 13.333, height: 7.5 });
pptx.layout = 'CUSTOM_WIDE';
pptx.defineSlideMaster({
  title: 'MASTER',
  background: { color: 'F5F1E8' },
  objects: [
    { rect: { x: 0, y: 0, w: 13.333, h: 0.13, fill: { color: 'EA5B36' }, line: { color: 'EA5B36' } } },
    { text: { text: 'BUSAN GIFTED EDUCATION INSTITUTE  |  TEAM ROLE MATCHING', options: { x: 0.55, y: 7.08, w: 8, h: 0.16, fontFace: 'Aptos', fontSize: 5.5, color: '52726B', charSpacing: 1.2, margin: 0 } } },
    { text: { text: '배도훈', options: { x: 11.9, y: 7.04, w: 0.8, h: 0.2, fontFace: 'Noto Sans KR', fontSize: 6.5, color: '52726B', align: 'right', margin: 0 } } },
  ],
  slideNumber: { x: 12.72, y: 7.03, color: 'EA5B36', fontFace: 'Aptos', fontSize: 7 },
});

const C = { ink: '163A43', teal: '087E8B', orange: 'EA5B36', yellow: 'F4C95D', cream: 'F5F1E8', paper: 'FFFDF8', sage: 'B8D8BA', muted: '52726B', paleTeal: 'DDEFEF', paleOrange: 'FBE4DC' };
const S = pptx.ShapeType;
const addText = (slide, text, x, y, w, h, options = {}) => slide.addText(text, { x, y, w, h, margin: 0, breakLine: false, fit: 'shrink', fontFace: 'Noto Sans KR', color: C.ink, valign: 'mid', ...options });
const box = (slide, x, y, w, h, fill, radius = 0.12, line = fill) => slide.addShape(radius ? S.roundRect : S.rect, { x, y, w, h, rectRadius: radius, fill: { color: fill }, line: { color: line, transparency: line === fill ? 100 : 0 } });
const line = (slide, x1, y1, x2, y2, color = C.teal, width = 1.5, dash = 'solid') => slide.addShape(S.line, { x: x1, y: y1, w: x2 - x1, h: y2 - y1, line: { color, width, dashType: dash, beginArrowType: 'none', endArrowType: 'none' } });
const title = (slide, kicker, headline, sub = '') => {
  addText(slide, kicker.toUpperCase(), 0.62, 0.46, 3.8, 0.22, { fontFace: 'Aptos', fontSize: 7, bold: true, color: C.orange, charSpacing: 1.4 });
  addText(slide, headline, 0.6, 0.75, 12.1, 0.55, { fontSize: 23, bold: true, color: C.ink });
  if (sub) addText(slide, sub, 0.62, 1.38, 11.6, 0.28, { fontSize: 8.5, color: C.muted });
};
const node = (slide, label, x, y, color, w = 1.35) => { box(slide, x, y, w, 0.45, color); addText(slide, label, x, y + 0.02, w, 0.36, { fontSize: 10, bold: true, color: color === C.yellow ? C.ink : 'FFFFFF', align: 'center' }); };

// 1. Title
{
  const s = pptx.addSlide('MASTER');
  s.background = { color: C.cream };
  s.addShape(S.arc, { x: 9.45, y: -1.25, w: 5.8, h: 5.8, adjustPoint: 0.25, line: { color: C.paleTeal, width: 28, transparency: 20 }, fill: { color: C.cream, transparency: 100 } });
  s.addShape(S.arc, { x: 9.95, y: 0.1, w: 3.3, h: 3.3, adjustPoint: 0.25, line: { color: C.orange, width: 8, transparency: 10 }, fill: { color: C.cream, transparency: 100 } });
  addText(s, 'DISCRETE MATH x VIBE CODING', 0.72, 0.75, 4.2, 0.25, { fontFace: 'Aptos', fontSize: 9, bold: true, color: C.orange, charSpacing: 1.6 });
  addText(s, '팀원 최적\n역할 매칭 서비스 개발', 0.66, 1.25, 8.4, 1.55, { fontSize: 31, bold: true, breakLine: true, fit: 'shrink' });
  addText(s, '이분 그래프 알고리즘과 AI 바이브 코딩을 활용한\n조건 맞춤형 역할 분담 웹 앱', 0.73, 3.08, 6.4, 0.65, { fontSize: 14, color: C.muted, breakLine: true });
  line(s, 0.73, 4.12, 5.15, 4.12, C.orange, 2.2);
  addText(s, '부산광역시교육청정보영재교육원', 0.73, 4.42, 4.6, 0.28, { fontSize: 10, color: C.ink });
  addText(s, '발표자  배도훈', 0.73, 4.76, 3.1, 0.28, { fontSize: 10, bold: true, color: C.teal });
  // Decorative matching diagram.
  [['팀원 A', 9.02, 4.18, C.teal], ['팀원 B', 9.02, 5.08, C.teal], ['역할 1', 11.25, 4.18, C.orange], ['역할 2', 11.25, 5.08, C.orange]].forEach(([t, x, y, c]) => node(s, t, x, y, c));
  line(s, 10.37, 4.4, 11.25, 5.3, C.teal, 1.8);
  line(s, 10.37, 5.3, 11.25, 4.4, C.orange, 1.8);
}

// 2. Problem
{
  const s = pptx.addSlide('MASTER'); title(s, '01 / Why', '역할 분담은 왜 늘 어려울까?', '일상적인 팀 활동의 갈등을 수학적 문제로 바라보았습니다.');
  const cards = [
    ['01', '역할 불만', '원하지 않는 역할을 맡거나\n특정 인원에게 업무가 쏠립니다.', C.paleOrange, C.orange],
    ['02', '비효율적 배분', '순서대로 배정하면 뒤에 남은\n팀원의 선택지가 급격히 줄어듭니다.', C.paleTeal, C.teal],
    ['03', '의사결정 지연', '모두의 조건을 만족하는 조합을\n사람이 직접 찾기 어렵습니다.', 'EEF1D6', '668A31'],
  ];
  cards.forEach(([n, h, body, fill, accent], i) => { const x = 0.7 + i * 4.15; box(s, x, 2.15, 3.65, 3.2, fill, 0.2); addText(s, n, x + 0.3, 2.48, 0.6, 0.28, { fontFace: 'Aptos Display', fontSize: 16, bold: true, color: accent }); addText(s, h, x + 0.3, 3.05, 2.7, 0.38, { fontSize: 18, bold: true }); addText(s, body, x + 0.3, 3.75, 2.95, 0.72, { fontSize: 10.5, color: C.muted, breakLine: true }); });
  addText(s, '핵심 질문  |  “각 팀원에게 가능한 역할을 하나씩, 빠짐없이 배정할 수 있을까?”', 0.92, 5.95, 11.4, 0.42, { fontSize: 15, bold: true, color: C.ink, align: 'center' });
}

// 3. Modeling
{
  const s = pptx.addSlide('MASTER'); title(s, '03 / Modeling', '이분 그래프로 역할 선택을 표현');
  addText(s, 'V₁ : 팀원 집합', 1.05, 1.98, 2.0, 0.25, { fontSize: 11, bold: true, color: C.teal }); addText(s, 'V₂ : 역할 집합', 9.8, 1.98, 2.0, 0.25, { fontSize: 11, bold: true, color: C.orange, align: 'right' });
  const left = [['민준', 2.55], ['서윤', 3.55], ['도훈', 4.55]], right = [['발표', 2.55], ['자료조사', 3.55], ['디자인', 4.55]];
  // All potential edges behind nodes.
  [[2.78,2.77,9.2,2.77],[2.78,2.77,9.2,3.77],[2.78,3.77,9.2,3.77],[2.78,3.77,9.2,4.77],[2.78,4.77,9.2,3.77],[2.78,4.77,9.2,4.77]].forEach(e => line(s, ...e, '9FC8C4', 1.4));
  left.forEach(([t,y]) => node(s,t,1.35,y,C.teal)); right.forEach(([t,y]) => node(s,t,9.2,y,C.orange));
  box(s, 3.45, 5.72, 6.45, 0.65, C.paleTeal, 0.1); addText(s, '간선 E  =  “해당 팀원이 이 역할을 맡을 수 있음”', 3.45, 5.89, 6.45, 0.22, { fontSize: 11.5, bold: true, align: 'center', color: C.ink });
  addText(s, '서로 같은 집합 안에서는 연결하지 않고, 팀원과 역할 사이만 연결합니다.', 1.42, 6.66, 10.5, 0.2, { fontSize: 8, color: C.muted, align: 'center' });
}

// 4. Initial prompt and greedy error
{
  const s = pptx.addSlide('MASTER'); title(s, '03 / Trial & Error', 'AI의 첫 번째 답: “앞에서부터 배정”');
  box(s, 0.72, 1.95, 5.5, 3.85, 'FFFFFF', 0.18); addText(s, '초기 프롬프트의 핵심 요청', 1.05, 2.28, 3.2, 0.3, { fontSize: 14, bold: true });
  box(s, 1.03, 2.85, 4.85, 1.65, C.ink, 0.12); addText(s, '“각 팀원의 선택 가능 역할을 받고\n중복 없는 1:1 역할 배정 결과를\n만드는 웹 앱을 구현해 줘.”', 1.32, 3.12, 4.2, 0.9, { fontSize: 13, color: 'FFFFFF', bold: true, breakLine: true });
  addText(s, '문제: 알고리즘 조건이 충분히 명확하지 않았습니다.', 1.05, 5.12, 4.75, 0.2, { fontSize: 8.5, color: C.orange, bold: true });
  box(s, 6.65, 1.95, 5.95, 3.85, C.paleOrange, 0.18); addText(s, 'AI가 제시한 탐욕적 방식', 7.0, 2.28, 3.3, 0.3, { fontSize: 14, bold: true });
  addText(s, '첫 팀원부터 가능한 역할을\n즉시 하나씩 선택', 7.0, 2.82, 3.5, 0.55, { fontSize: 14, bold: true, color: C.orange, breakLine: true });
  line(s, 8.25, 3.75, 8.25, 4.72, C.orange, 2.3); s.addShape(S.downArrow, { x: 8.04, y: 4.48, w: 0.42, h: 0.35, fill: { color: C.orange }, line: { color: C.orange } });
  addText(s, '뒤 팀원에게 가능한 역할이\n남지 않는 경우가 발생', 7.0, 4.92, 4.3, 0.5, { fontSize: 14, bold: true, color: C.ink, breakLine: true });
  addText(s, '탐욕적 선택은 “지금 가능”만 보며, 전체 완성 가능성은 보장하지 못합니다.', 0.85, 6.22, 11.7, 0.35, { fontSize: 12.5, bold: true, align: 'center', color: C.ink });
}

// 5. Solution algorithm
{
  const s = pptx.addSlide('MASTER'); title(s, '04 / Solution', '백트래킹으로 가능한 조합을 끝까지 탐색');
  const steps = [['1', '팀원 선택', '아직 배정되지 않은\n팀원을 하나 고릅니다.'], ['2', '역할 시도', '선택 가능한 역할 중\n미사용 역할을 시도합니다.'], ['3', '다음 단계', '다음 팀원도 배정 가능한지\n재귀적으로 확인합니다.'], ['4', '되돌리기', '막히면 이전 선택을 취소하고\n다른 역할을 시도합니다.']];
  steps.forEach(([n,h,b],i)=>{const x=.6+i*3.15;box(s,x,2.2,2.65,2.9,i===3?C.paleOrange:'FFFFFF',.16);box(s,x+.25,2.45,.46,.46,i===3?C.orange:C.teal);addText(s,n,x+.25,2.54,.46,.16,{fontFace:'Aptos',fontSize:10,bold:true,color:'FFFFFF',align:'center'});addText(s,h,x+.25,3.25,2.05,.28,{fontSize:14,bold:true});addText(s,b,x+.25,3.83,2.1,.62,{fontSize:9.5,color:C.muted,breakLine:true});if(i<3){line(s,x+2.72,3.65,x+3.1,3.65,C.orange,1.8);s.addShape(S.chevron,{x:x+2.98,y:3.5,w:.2,h:.3,fill:{color:C.orange},line:{color:C.orange}})}});
  addText(s,'목표: 모든 팀원이 서로 다른 역할 하나씩을 갖는 완전 매칭을 찾는다.',1.1,5.9,11.1,.36,{fontSize:15,bold:true,align:'center',color:C.ink});
}

// 6. Conditions/verification
{
  const s = pptx.addSlide('MASTER'); title(s, '05 / Verification', '완전 매칭 조건으로 결과를 검증');
  const checks = [['팀원 수 = 역할 수', '1:1 배정의 기본 전제'], ['각 필수 역할의 차수 ≥ 1', '어떤 팀원도 맡을 수 없는 역할이 없어야 함'], ['모든 팀원 배정 완료', '중복과 누락 없이 결과가 완성되어야 함']];
  checks.forEach(([h,b],i)=>{const y=1.95+i*1.2;box(s,.85,y,11.6,.87,'FFFFFF',.12);box(s,1.15,y+.2,.45,.45,i===1?C.orange:C.teal);addText(s,'✓',1.15,y+.25,.45,.16,{fontFace:'Aptos',fontSize:12,bold:true,color:'FFFFFF',align:'center'});addText(s,h,1.95,y+.18,3.9,.23,{fontSize:13,bold:true});addText(s,b,1.95,y+.52,8.7,.16,{fontSize:8.7,color:C.muted});});
  box(s,2.18,5.72,8.98,.57,C.paleTeal,.1); addText(s,'단, 이 조건은 필요조건입니다. 실제 완전 매칭의 존재 여부는 탐색 알고리즘으로 최종 확인합니다.',2.38,5.9,8.58,.18,{fontSize:9.2,bold:true,align:'center',color:C.ink});
}

// 7. Application
{
  const s = pptx.addSlide('MASTER'); title(s, '06 / Application', '알고리즘을 역할 분담 웹 앱으로 연결');
  const layers = [['INPUT', '입력부', '팀원과 역할 목록,\n선택 가능 조건을 입력'], ['PROCESS', '연산부', '이분 그래프 생성 후\n백트래킹 매칭 탐색'], ['OUTPUT', '출력부', '중복·누락 없는\n1:1 배정 결과를 표시']];
  layers.forEach(([en,h,b],i)=>{const x=.82+i*4.15;box(s,x,2.12,3.55,3.15,i===1?C.ink:'FFFFFF',.2);addText(s,en,x+.3,2.52,2.5,.2,{fontFace:'Aptos',fontSize:8,bold:true,color:i===1?C.yellow:C.orange,charSpacing:1.2});addText(s,h,x+.3,3.1,2.1,.34,{fontSize:18,bold:true,color:i===1?'FFFFFF':C.ink});addText(s,b,x+.3,3.87,2.7,.6,{fontSize:11,color:i===1?'E7F1EF':C.muted,breakLine:true});if(i<2){s.addShape(S.rightArrow,{x:x+3.64,y:3.38,w:.42,h:.45,fill:{color:C.orange},line:{color:C.orange}})}});
  addText(s,'AI 바이브 코딩은 구현 속도를 높였고, 이산수학은 결과의 논리적 정확성을 보완했습니다.',1.0,5.92,11.3,.3,{fontSize:13.5,bold:true,align:'center'});
}

// 8. Value
{
  const s = pptx.addSlide('MASTER'); title(s, '07 / Result', '더 공정하고 빠른 팀 의사결정');
  const values = [['공정성', '개인의 가능 조건을\n동일하게 반영'], ['신뢰성', '중복·누락 없는\n배정 결과 제공'], ['효율성', '조합 탐색 시간을 줄여\n의사결정 속도 향상']];
  values.forEach(([h,b],i)=>{const x=1.1+i*3.75;s.addShape(S.ellipse,{x:x+.85,y:2.05,w:1.15,h:1.15,fill:{color:[C.teal,C.orange,'668A31'][i]},line:{color:'FFFFFF',transparency:100}});addText(s,String(i+1),x+.85,2.39,1.15,.27,{fontFace:'Aptos',fontSize:18,bold:true,color:'FFFFFF',align:'center'});addText(s,h,x,3.65,2.85,.32,{fontSize:17,bold:true,align:'center'});addText(s,b,x,4.25,2.85,.52,{fontSize:10.5,color:C.muted,align:'center',breakLine:true});});
  box(s,2.12,5.65,9.1,.58,C.paleOrange,.1);addText(s,'조별 과제와 동아리 활동에서 역할 갈등을 줄이고, 합리적인 출발점을 제시합니다.',2.32,5.85,8.7,.2,{fontSize:11.5,bold:true,align:'center'});
}

// 9. Limits
{
  const s = pptx.addSlide('MASTER'); title(s, '08 / Future Work', '“가능한 배정”에서 “더 만족스러운 배정”으로');
  const futures = [['선호도 가중치', '단순 가능/불가(0/1)를 넘어\n1~3순위 선호도를 반영합니다.', 'Weighted Matching'], ['다대다 매칭', '한 사람이 여러 역할을 맡거나\n한 역할을 여럿이 맡도록 확장합니다.', 'Capacity Constraint'], ['사용자 검증', '실제 팀 활동에 적용하여\n만족도와 사용성을 측정합니다.', 'User Feedback']];
  futures.forEach(([h,b,tag],i)=>{const y=1.95+i*1.25;box(s,.82,y,11.7,.93,'FFFFFF',.12);box(s,1.08,y+.2,2.15,.47,[C.paleTeal,C.paleOrange,'EEF1D6'][i],.08);addText(s,tag,1.08,y+.33,2.15,.14,{fontFace:'Aptos',fontSize:6.5,bold:true,color:[C.teal,C.orange,'668A31'][i],align:'center',charSpacing:.5});addText(s,h,3.65,y+.18,2.1,.2,{fontSize:12.5,bold:true});addText(s,b,6.1,y+.18,5.6,.42,{fontSize:9.5,color:C.muted,breakLine:true});});
  addText(s,'향후에는 수학적 모델의 표현력과 서비스의 실용성을 함께 넓혀 가겠습니다.',1.0,5.98,11.3,.28,{fontSize:13,bold:true,align:'center'});
}

// 10. Closing
{
  const s = pptx.addSlide('MASTER'); s.background = { color: C.ink };
  addText(s,'THANK YOU',.73,.78,3,.25,{fontFace:'Aptos',fontSize:9,bold:true,color:C.yellow,charSpacing:1.8});
  addText(s,'수학적 모델링이\n더 나은 협업을 만듭니다.',.7,1.45,8.1,1.25,{fontSize:29,bold:true,color:'FFFFFF',breakLine:true});
  addText(s,'팀원 최적 역할 매칭 서비스 개발',.74,3.35,4.6,.25,{fontSize:11,color:'D5E6E2'});
  line(s,.74,4.05,5.2,4.05,C.orange,2);
  addText(s,'Q & A',.74,4.45,2.4,.5,{fontFace:'Aptos Display',fontSize:25,bold:true,color:C.orange});
  [['A',8.85,3.5,C.teal],['B',8.85,4.65,C.teal],['1',11.05,3.5,C.orange],['2',11.05,4.65,C.orange]].forEach(([t,x,y,c])=>node(s,t,x,y,c,1.1)); line(s,9.95,3.72,11.05,4.87,'B8D8BA',1.8);line(s,9.95,4.87,11.05,3.72,'F4C95D',1.8);
}

pptx.writeFile({ fileName: '팀원_최적_역할_매칭_발표_배도훈.pptx' });
