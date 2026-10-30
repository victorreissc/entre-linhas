import { CheckCheck, ChevronLeft } from 'lucide-react';

// Moldura de celular com uma conversa. mensagens: [{ de: 'eu'|'ela'|'sistema', texto, hora, autor }]
export function Celular({ contato, mensagens, grande = false }) {
  const iniciais = contato.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className={`celular ${grande ? 'celular--grande' : ''}`}>
      <div className="celular__topo">
        <ChevronLeft size={18} />
        <span className="celular__avatar">{iniciais}</span>
        <div>
          <strong>{contato}</strong>
          <small>online</small>
        </div>
      </div>
      <div className="celular__conversa">
        {mensagens.map((m, i) =>
          m.de === 'sistema' ? (
            <div key={i} className="celular__sistema mono">{m.texto}</div>
          ) : (
            <div key={i} className={`balao balao--${m.de === 'eu' ? 'eu' : 'outro'}`} style={{ animationDelay: `${i * 0.35}s` }}>
              {m.autor && <span className="balao__autor">{m.autor}</span>}
              <span>{m.texto}</span>
              {m.hora && (
                <span className="balao__hora mono">
                  {m.hora}
                  {m.de === 'eu' && <CheckCheck size={13} />}
                </span>
              )}
            </div>
          ),
        )}
      </div>
    </div>
  );
}
