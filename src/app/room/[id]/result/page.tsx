"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const [responses, setResponses] = useState<any[]>([]);
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    
    const unsubscribeRoom = onSnapshot(doc(db, "rooms", roomId), (docSnap) => {
      if (docSnap.exists()) {
        setRoomData(docSnap.data());
      }
    });

    const unsubscribeResponses = onSnapshot(collection(db, `rooms/${roomId}/responses`), (snapshot) => {
      const data = snapshot.docs.map(d => d.data());
      setResponses(data);
    });

    return () => {
      unsubscribeRoom();
      unsubscribeResponses();
    };
  }, [roomId]);

  const [isHost, setIsHost] = useState(false);
  useEffect(() => {
    if (roomData) {
      const localToken = localStorage.getItem(`magic_conch_host_${roomId}`);
      if (localToken && localToken === roomData.hostToken) {
        setIsHost(true);
      }
    }
  }, [roomData, roomId]);

  const askMagicConch = async () => {
    if (!isHost) return alert("방을 만든 사람만 소라고둥을 깨울 수 있어요!");
    if (responses.length === 0) return alert("아직 응답한 사람이 없습니다!");
    
    setAsking(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Save result to Firebase so everyone sees it
      await updateDoc(doc(db, "rooms", roomId), {
        status: "done",
        result: data
      });
      
    } catch (e: any) {
      console.error(e);
      alert("분석 중 오류가 발생했습니다: " + e.message);
    } finally {
      setAsking(false);
    }
  };

  if (!roomData) return <div className="container">로딩 중...</div>;

  const hasResult = roomData.status === "done" && roomData.result;

  return (
    <main className="container">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px' }}>
        
        {/* Result View */}
        {hasResult ? (
          <div style={{ animation: 'fadeIn 1s ease-in' }}>
            <div className="animate-float" style={{ fontSize: '5rem', marginBottom: '1rem' }}>🐚</div>
            <h1 className="title text-gradient" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>마법의 소라고둥의 선택</h1>
            
            <div style={{ background: 'rgba(255,255,255,0.7)', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', fontStyle: 'italic', color: '#555' }}>
              "{roomData.result.summary_reason}"
            </div>

            <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>추천 식당 Top 3</h3>
            
            {roomData.result.places && roomData.result.places.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {roomData.result.places.map((place: any, i: number) => (
                  <a 
                    key={i} 
                    href={place.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'block', 
                      padding: '1.2rem', 
                      background: 'white', 
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: 'inherit',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                      transition: 'transform 0.2s',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.3rem' }}>
                      {i + 1}. {place.name}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.3rem' }}>{place.category}</div>
                    <div style={{ fontSize: '0.9rem', color: '#999' }}>{place.address}</div>
                  </a>
                ))}
              </div>
            ) : (
              <div style={{ padding: '2rem', background: '#fff', borderRadius: '12px', color: '#666' }}>
                앗! 모두의 취향이 너무 독특해서 소라고둥도 적당한 식당을 찾지 못했어요.<br/>대신 아무 고깃집이나 가는 건 어떨까요? 😅
              </div>
            )}
            
            <button className="btn-secondary" style={{ marginTop: '2rem' }} onClick={() => router.push('/')}>
              처음으로 돌아가기
            </button>
          </div>
        ) : (
          /* Waiting View */
          <div>
            <h1 className="title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>현황판</h1>
            <p className="subtitle">누가누가 제출했나 볼까요?</p>
            
            <div style={{ background: 'rgba(255,255,255,0.5)', padding: '1.5rem', borderRadius: '16px', minHeight: '150px', marginBottom: '2rem' }}>
              {responses.length === 0 ? (
                <p style={{ color: '#888', marginTop: '2rem' }}>아직 제출한 사람이 없어요.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                  {responses.map((r, i) => (
                    <li key={i} style={{ background: 'var(--primary)', color: 'white', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' }}>
                      {r.name} 완료!
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {isHost ? (
              <button 
                className="btn-magic animate-pulse" 
                style={{ width: '100%' }} 
                onClick={askMagicConch}
                disabled={asking || responses.length === 0}
              >
                {asking ? "소라고둥이 고민 중... 🌀" : "모두 모였다면! 소라고둥에게 묻기 ✨"}
              </button>
            ) : (
              <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', color: '#555' }}>
                방장이 소라고둥을 깨울 때까지 기다려주세요! 🤫
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
