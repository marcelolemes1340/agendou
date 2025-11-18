import { Suspense } from 'react';
import AgendamentoClient from './AgendamentoClient';

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-white">Carregando página de agendamento...</p>
      </div>
    }>
      <AgendamentoClient />
    </Suspense>
  );
}
