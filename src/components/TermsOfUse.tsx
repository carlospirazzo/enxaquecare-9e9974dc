import { FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TermsOfUseProps {
  open: boolean;
  onClose: () => void;
}

export const TermsOfUse = ({ open, onClose }: TermsOfUseProps) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="max-w-md max-h-[85vh] p-0">
      <DialogHeader className="px-6 pt-6 pb-2">
        <DialogTitle className="font-serif text-xl flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Termos de Uso e Privacidade
        </DialogTitle>
      </DialogHeader>
      <ScrollArea className="px-6 pb-6 max-h-[65vh]">
        <div className="space-y-5 pr-3 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h3 className="text-base font-semibold text-foreground mb-2">Termos de Uso</h3>
            <p>
              Ao usar este aplicativo entendo que ele foi idealizado para o acompanhamento de pacientes com quadros de enxaqueca por profissionais da área médica, não sendo indicado para outros e não é substituto para o raciocínio clínico ou do médico. Compreendo que o aplicativo é meramente uma referência que deve ser utilizado com outros métodos para atestar a validade dos dados calculados. Entendo que este aplicativo não substitui outros métodos diagnósticos ou terapêuticos e que a utilização do mesmo não responsabiliza os criadores por quaisquer danos decorrentes do seu uso independentemente das circunstâncias.
            </p>
            <p className="mt-2">
              Entendo por fim que o uso de qualquer medicamento pode trazer riscos a saúde e efeitos colaterais, devendo consultar um médico e ler a bula.
            </p>
          </section>

          <section>
            <h3 className="text-base font-semibold text-foreground mb-2">Política de Privacidade</h3>

            <h4 className="font-semibold text-foreground mt-3 mb-1">Informações Coletadas</h4>
            <p>
              O aplicativo não coleta dados pessoais dos usuários do aplicativo e não envia e-mail solicitando informações, tais como senhas e outros dados pessoais. Este aplicativo está de acordo com as disposições da Lei Federal Brasileira n. 13.709/2018 (Lei Geral de Dados Pessoais – LGPD).
            </p>
            <p className="mt-2">
              O aplicativo permite o envio de e-mail voluntário por parte do usuário por onde pode-se sanar eventuais dúvidas, sugestões ou reclamações, podendo esses e-mails também serem utilizados em eventuais litígios.
            </p>

            <h4 className="font-semibold text-foreground mt-3 mb-1">Público-Alvo</h4>
            <p>
              O aplicativo deve ser utilizado por pacientes para acompanhamento dos quadros de enxaqueca por profissionais de saúde capacitados.
            </p>

            <h4 className="font-semibold text-foreground mt-3 mb-1">Disposições Gerais</h4>
            <p>
              A utilização do aplicativo implica no aceite, por parte dos usuários, das condições e termos desta política. O proprietário reserva-se o direito de alterar os termos desta Política de Privacidade a qualquer momento, mediante comunicação aos seus usuários por notificação do aplicativo ou mudança na Política de Privacidade que pode ser encontrada neste endereço eletrônico.
            </p>

            <h4 className="font-semibold text-foreground mt-3 mb-1">Contato</h4>
            <p>
              O usuário poderá entrar em contato através do e-mail{' '}
              <a href="mailto:enxaquecare@gmail.com" className="text-primary underline">
                enxaquecare@gmail.com
              </a>{' '}
              para esclarecimento de quaisquer dúvidas sobre esta política de privacidade.
            </p>
          </section>
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
);
