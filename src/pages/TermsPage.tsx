import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <FileText className="w-5 h-5 text-primary" />
          <h1 className="font-serif text-xl font-bold">Termos de Uso e Privacidade</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Termos de Uso</h2>
          <p>
            Ao usar este aplicativo entendo que ele foi idealizado para o acompanhamento de pacientes com quadros de enxaqueca por profissionais da área médica, não sendo indicado para outros e não é substituto para o raciocínio clínico ou do médico. Compreendo que o aplicativo é meramente uma referência que deve ser utilizado com outros métodos para atestar a validade dos dados calculados. Entendo que este aplicativo não substitui outros métodos diagnósticos ou terapêuticos e que a utilização do mesmo não responsabiliza os criadores por quaisquer danos decorrentes do seu uso independentemente das circunstâncias.
          </p>
          <p className="mt-3">
            Entendo por fim que o uso de qualquer medicamento pode trazer riscos a saúde e efeitos colaterais, devendo consultar um médico e ler a bula.
          </p>
          <p className="mt-3">
            Fica eleito o fórum da cidade de Belo Horizonte, MG, Brasil para dirimir quaisquer disputas decorrentes do uso deste aplicativo.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Política de Privacidade</h2>

          <h3 className="font-semibold text-foreground mt-4 mb-1">Informações Coletadas</h3>
          <p>
            O aplicativo não coleta dados pessoais dos usuários do aplicativo e não envia e-mail solicitando informações, tais como senhas e outros dados pessoais. Este aplicativo está de acordo com as disposições da Lei Federal Brasileira n. 13.709/2018 (Lei Geral de Dados Pessoais – LGPD).
          </p>
          <p className="mt-2">
            O aplicativo permite o envio de e-mail voluntário por parte do usuário por onde pode-se sanar eventuais dúvidas, sugestões ou reclamações, podendo esses e-mails também serem utilizados em eventuais litígios.
          </p>

          <h3 className="font-semibold text-foreground mt-4 mb-1">Público-Alvo</h3>
          <p>
            O aplicativo deve ser utilizado por pacientes para acompanhamento dos quadros de enxaqueca por profissionais de saúde capacitados.
          </p>

          <h3 className="font-semibold text-foreground mt-4 mb-1">Disposições Gerais</h3>
          <p>
            A utilização do aplicativo implica no aceite, por parte dos usuários, das condições e termos desta política. O proprietário reserva-se o direito de alterar os termos desta Política de Privacidade a qualquer momento, mediante comunicação aos seus usuários por notificação do aplicativo ou mudança na Política de Privacidade que pode ser encontrada neste endereço eletrônico.
          </p>

          <h3 className="font-semibold text-foreground mt-4 mb-1">Contato</h3>
          <p>
            O usuário poderá entrar em contato através do e-mail{' '}
            <a href="mailto:enxaquecare@gmail.com" className="text-primary underline">
              enxaquecare@gmail.com
            </a>{' '}
            para esclarecimento de quaisquer dúvidas sobre esta política de privacidade.
          </p>
        </section>
      </main>
    </div>
  );
};

export default TermsPage;
