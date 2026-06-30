"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [likes, setLikes] = useState('');
  const [dislikes, setDislikes] = useState('');
  const [price, setPrice] = useState('상관없음');

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) {
      alert("이름과 위치는 꼭 적어주세요!");
      return;
    }
    
    setLoading(true);
    try {
      await addDoc(collection(db, `rooms/${roomId}/responses`), {
        name,
        location,
        likes,
        dislikes,
        price,
        submittedAt: new Date()
      });
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      alert("앗, 제출 중 오류가 발생했어요. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="glass-panel" style={{ textAlign: 'left', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '3rem', cursor: 'pointer' }} onClick={() => router.push('/')}>🐚</div>
          <h1 className="title" style={{ fontSize: '2rem' }}>마법의 소라고둥</h1>
          <p className="subtitle" style={{ marginBottom: '0' }}>비밀스럽게 취향을 모아보세요</p>
          
          <div style={{ 
            background: 'rgba(255,255,255,0.7)', 
            padding: '0.7rem 1rem', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginTop: '1.5rem',
            border: '1px solid rgba(155, 89, 182, 0.2)'
          }}>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>친구에게 초대 링크 보내기</span>
            <button onClick={copyLink} style={{ 
              background: copied ? '#2ecc71' : 'var(--primary)', 
              color: 'white', 
              border: 'none', 
              padding: '6px 12px', 
              borderRadius: '8px', 
              cursor: 'pointer',
              transition: 'background 0.3s'
            }}>
              {copied ? '복사 완료!' : '링크 복사'}
            </button>
          </div>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 0', animation: 'float 3s infinite' }}>
            <h2 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '1rem' }}>제출 완료! ✨</h2>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
              다른 친구들의 응답을 기다리고 있어요.<br/>
              모두가 모이면 호스트가 소라고둥에게<br/>
              결과를 물어볼 거예요!
            </p>
            <button className="btn-secondary" onClick={() => router.push(`/room/${roomId}/result`)} style={{ marginTop: '2rem' }}>
              결과 확인 페이지로 가기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-main)' }}>당신의 이름 (또는 닉네임)</label>
              <input 
                type="text" 
                value={name} onChange={e => setName(e.target.value)}
                placeholder="예: 뚱이" 
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem' }} 
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-main)' }}>1. 출발 장소 (사는 곳, 회사 등)</label>
              <input 
                type="text" 
                value={location} onChange={e => setLocation(e.target.value)}
                placeholder="예: 강남역, 판교" 
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-main)' }}>2. 좋아하는 음식</label>
              <input 
                type="text" 
                value={likes} onChange={e => setLikes(e.target.value)}
                placeholder="예: 삼겹살, 파스타, 초밥" 
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-main)' }}>3. 못 먹는 음식 (알레르기 포함)</label>
              <input 
                type="text" 
                value={dislikes} onChange={e => setDislikes(e.target.value)}
                placeholder="예: 오이 빼주세요, 해산물 알레르기" 
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-main)' }}>4. 생각하는 가격대 (1인 기준)</label>
              <select 
                value={price} onChange={e => setPrice(e.target.value)}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem', fontFamily: 'inherit' }}
              >
                <option>상관없음</option>
                <option>1만원대</option>
                <option>2만원대</option>
                <option>3만원 이상</option>
              </select>
            </div>

            <button type="submit" className="btn-magic" style={{ marginTop: '1rem' }} disabled={loading}>
              {loading ? "전송 중..." : "비밀스럽게 제출하기 🤫"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
