import { AlertTriangle, Hourglass, Loader2, PlugZap } from 'lucide-react';
import { useDados } from '../hooks/DadosContexto.jsx';

// Mostra o motivo de não haver dados para exibir — nunca inventa números.
export function SemDados({ titulo, texto, icone: Icone = Hourglass }) {
  return (
    <div className="sem-dados">
      <Icone size={22} strokeWidth={1.5} />
      <div>
        <strong>{titulo}</strong>
        {texto && <p>{texto}</p>}
      </div>
    </div>
  );
}

// Envolve conteúdo que depende dos resultados: trata carregamento,
// integração ausente e erro antes de renderizar os filhos.
export function ComResultados({ children }) {
  const { resultados, carregando, erro, naoConfigurado } = useDados();
  if (carregando) return <SemDados icone={(p) => <Loader2 {...p} className="girando" />} titulo="Carregando resultados…" />;
  if (!resultados && naoConfigurado) {
    return (
      <SemDados
        icone={PlugZap}
        titulo="Integração com o Google Sheets não configurada"
        texto="Os resultados aparecem aqui assim que o Apps Script estiver publicado e as variáveis estiverem no Vercel. Para ensaiar, abra a apresentação com ?demo=1 no endereço."
      />
    );
  }
  if (!resultados && erro) return <SemDados icone={AlertTriangle} titulo="Não foi possível carregar os resultados" texto={erro.message} />;
  if (!resultados) return <SemDados titulo="Sem resultados ainda" />;
  return children(resultados);
}
