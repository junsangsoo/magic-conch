import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { responses } = await req.json();

    if (!responses || responses.length === 0) {
      return NextResponse.json({ error: "응답 데이터가 없습니다." }, { status: 400 });
    }

    // 1. Gemini API 호출하여 분석 및 검색어 도출
    const prompt = `
      너는 '마법의 소라고둥'이라는 친근하고 유머러스한 AI야.
      친구들이 식사 약속을 잡기 위해 제출한 선호도 데이터를 바탕으로 최적의 약속 장소 키워드를 추천해줘.
      
      [데이터]
      ${JSON.stringify(responses, null, 2)}
      
      [조건]
      1. 참가자들의 '출발 장소'들을 고려하여 중간 지점이나 가장 많이 겹치는 지역을 정해.
      2. '좋아하는 음식' 중 공통된 것을 찾고, '못 먹는 음식(알레르기 등)'은 반드시 제외해.
      3. '생각하는 가격대'를 고려해서 예산에 맞는 식당을 찾을 수 있도록 해.
      4. 결과는 오직 아래 JSON 형식으로만 반환해. 다른 말은 절대 추가하지 마.
      
      {
        "search_query": "지역명 + 음식종류 (예: 강남역 초밥)",
        "summary_reason": "마법의 소라고둥이 이렇게 추천하는 이유 (예: '다들 강남에서 모이기 쉽고, 해산물을 좋아하며 오이 알레르기를 피할 수 있는 완벽한 메뉴란다. 🐚')"
      }
    `;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      console.error("Gemini API Error:", errorText);
      throw new Error("Gemini API 호출에 실패했습니다.");
    }

    const geminiData = await geminiRes.json();
    const textResult = geminiData.candidates[0].content.parts[0].text;
    const { search_query, summary_reason } = JSON.parse(textResult);

    // 2. 카카오 로컬 API 호출하여 식당 검색
    const kakaoRes = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(search_query)}&size=3`, {
      method: 'GET',
      headers: {
        'Authorization': `KakaoAK ${process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY}`
      }
    });

    if (!kakaoRes.ok) {
      throw new Error("카카오 API 호출에 실패했습니다.");
    }

    const kakaoData = await kakaoRes.json();
    
    return NextResponse.json({
      summary_reason,
      places: kakaoData.documents.map((doc: any) => ({
        name: doc.place_name,
        address: doc.road_address_name || doc.address_name,
        category: doc.category_name,
        url: doc.place_url
      }))
    });

  } catch (error: any) {
    console.error("Analysis Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
