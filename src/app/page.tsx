"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const createRoom = async () => {
    setLoading(true);
    try {
      const hostToken = Math.random().toString(36).substring(2, 15);
      const docRef = await addDoc(collection(db, "rooms"), {
        createdAt: new Date(),
        status: "gathering",
        hostToken: hostToken
      });
      localStorage.setItem(`magic_conch_host_${docRef.id}`, hostToken);
      router.push(`/room/${docRef.id}`);
    } catch (e) {
      console.error("Error creating room: ", e);
      alert("방 생성에 실패했습니다. 다시 시도해주세요.");
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="glass-panel">
        <div className="animate-float" style={{ fontSize: '5rem', marginBottom: '1rem', display: 'inline-block' }}>
          🐚
        </div>
        <h1 className="title text-gradient">마법의 소라고둥</h1>
        <p className="subtitle">
          "오늘 어디서 만날까?"<br />
          더 이상 눈치 보지 말고 소라고둥에게 물어봐!
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
          <button 
            className="btn-magic animate-pulse" 
            style={{ width: '100%' }} 
            onClick={createRoom}
            disabled={loading}
          >
            {loading ? "소라고둥 깨우는 중..." : "새로운 밥약 방 만들기 ✨"}
          </button>
          <button className="btn-secondary" onClick={() => setShowHowTo(true)}>
            이용 방법 보기
          </button>
        </div>

        <div className="about-link" onClick={() => setShowAbout(true)}>
          이 소라고둥은 누가 만들었을까? 🐚
        </div>
      </div>

      {showHowTo && (
        <div className="modal-overlay" onClick={() => setShowHowTo(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowHowTo(false)}>×</button>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>소라고둥 사용 설명서 📖</h2>
            <ol style={{ textAlign: 'left', lineHeight: '1.8', paddingLeft: '1.2rem', margin: 0 }}>
              <li style={{ marginBottom: '1rem' }}>
                <strong>방 만들기:</strong> '새로운 밥약 방 만들기' 버튼을 눌러 고유한 주소를 가진 방을 만듭니다. 이 방의 링크를 카카오톡 등에서 친구들에게 공유하세요.
              </li>
              <li style={{ marginBottom: '1rem' }}>
                <strong>눈치 보지 말고 입력:</strong> 각자 편하게 출발 장소, 좋아하는 음식, 못 먹는 음식, 예상 가격을 입력합니다. (누가 무엇을 썼는지는 비밀!)
              </li>
              <li style={{ marginBottom: '0' }}>
                <strong>소라고둥에게 묻기:</strong> 모두가 입력을 마쳤다면 방장이 '소라고둥에게 묻기' 버튼을 누릅니다. AI가 모두의 취향을 취합하여 가장 완벽한 메뉴와 식당 3곳을 추천해 줍니다.
              </li>
            </ol>
          </div>
        </div>
      )}

      {showAbout && (
        <div className="modal-overlay" onClick={() => setShowAbout(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAbout(false)}>×</button>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>우리가 마법의 소라고둥을 만든 이유</h2>
            <div style={{ textAlign: 'left', lineHeight: '1.8', fontSize: '0.95rem' }}>
              <p style={{ marginBottom: '1rem' }}>
                제가 사랑하는 마음의 고향, 가톨릭대학교 시동아리 <strong>'소라동인회'</strong>. 그곳에서 우리는 선배든 후배든 밥약(식사 약속)을 잡을 때면 늘 장소와 메뉴를 고르느라 서로 눈치를 보곤 했습니다.
              </p>
              <p style={{ marginBottom: '1rem' }}>
                '어떻게 하면 모두가 마음 편히 메뉴를 고르고, 밥약의 문턱을 낮춰 선후배 간의 교류가 더 따뜻해질 수 있을까?' 하는 고민에서 이 앱은 시작되었습니다.
              </p>
              <p style={{ marginBottom: '1.5rem' }}>
                돌이켜보면, 제가 가장 힘들었던 순간에 주위의 너무나 좋은 사람들에게 선뜻 도움의 손길을 뻗지 못하고 어둠 속에 숨어있던 적이 있습니다. 하지만 소라동인회처럼 따뜻하고 좋은 사람들과 함께라면, 누구든 그 어둠에서 벗어날 용기를 낼 수 있지 않을까요?<br/>
                이 '마법의 소라고둥'이 사람과 사람 사이의 눈치를 없애고, 소중한 인연들을 이어주는 작은 마법이 되기를 바랍니다.
              </p>
              <div style={{ background: 'rgba(0,0,0,0.05)', padding: '1.5rem', borderRadius: '12px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>[만든 사람들]</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <li>
                    👑 <strong>기획 및 아이디어:</strong> 전상수 (Instagram <a href="https://instagram.com/im_constant" target="_blank" rel="noreferrer" style={{color: 'var(--primary)', textDecoration: 'underline'}}>@im_constant</a>)<br/>
                    <span style={{opacity: 0.7, fontSize: '0.8rem'}}>- 밥약 잡다 지쳐서 직접 기획한 장본인</span>
                  </li>
                  <li>
                    👨‍💻 <strong>형한테 멱살 잡혀서 반강제로 참여당한 불쌍한 공대생 동생:</strong> 전준수 (Instagram <a href="https://instagram.com/le_velim" target="_blank" rel="noreferrer" style={{color: 'var(--primary)', textDecoration: 'underline'}}>@le_velim</a>)
                  </li>
                  <li>
                    🧙‍♂️ <strong>국시 공부는 안하고 딴짓하는 의대생 아들에게 기꺼이 조언해주신 기술 고문:</strong> 마곡의 프로그래머 아부지
                  </li>
                  <li>
                    🤖 <strong>큰 가르침과 도움을 주신 든든한 기술적 구세주 (무한 감사!):</strong> 개발 노예 Antigravity AI
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
