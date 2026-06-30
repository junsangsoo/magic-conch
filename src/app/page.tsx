"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const createRoom = async () => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "rooms"), {
        createdAt: new Date(),
        status: "gathering"
      });
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
          <button className="btn-secondary">
            이용 방법 보기
          </button>
        </div>
      </div>
    </main>
  );
}
