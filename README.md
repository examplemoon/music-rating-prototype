# LisN — 청취 인증 음악 평점 (시제품)

왓챠피디아처럼 실제 곡 카탈로그를 둘러보고, **영상의 70% 이상을 실제로 재생해야** 0.25점 단위(1–5) 평점을 남길 수 있는 정적 시제품입니다.

- `songs.js`: 실제 곡 카탈로그(K-pop·힙합·R&B·인디·발라드·록·해외 팝). 각 곡의 YouTube ID는 공식 아티스트/레이블 채널 영상이며 oEmbed로 검증했습니다.
- 평가·사용자·추가곡은 브라우저 localStorage에만 저장됩니다(백엔드 없음).
- "예시 평가 불러오기"로 생성되는 사용자·리뷰는 **예시(가상) 데이터**입니다. 곡 자체는 실제 곡입니다.
- `?debug=1` 로 재생 시뮬레이션 버튼을 켤 수 있습니다.


## TODO: Google AdSense / ads.txt
- `rec.js` 상단 `ADSENSE_CLIENT`(ca-pub-...)와 `ADSENSE_SLOTS`를 채우면 실제 광고가 로드됩니다. 비어 있으면 placeholder 박스만 표시.
- `ads.txt`는 **도메인 루트**(`https://도메인/ads.txt`)에 있어야 합니다. `examplemoon.github.io/music-rating-prototype/` 같은 서브경로에는 루트 ads.txt를 둘 수 없고, AdSense 승인도 일반적으로 커스텀 도메인이 필요합니다 → 커스텀 도메인 연결 후 루트에 `google.com, pub-XXXXXXXX, DIRECT, f08c47fec0942fa0` 추가.
- 광고는 YouTube 플레이어·평가 컨트롤과 떨어진 위치에만 배치합니다.
