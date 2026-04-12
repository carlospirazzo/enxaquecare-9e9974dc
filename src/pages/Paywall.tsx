import { motion } from 'framer-motion';
import logoIcon from '@/assets/logo-icon.png';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Infinity, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const features = [
  'Registro ilimitado de episódios',
  'Relatório completo para o médico',
  'Diário de sono e bem-estar',
  'Exportação em PDF',
  'Notificações inteligentes',
  'Backup e migração de dados',
];

const Paywall = () => {
  const handlePurchase = (plan: 'monthly' | 'lifetime') => {
    toast({
      title: 'Compra via loja de apps',
      description: plan === 'monthly'
        ? 'A assinatura mensal de R$4,90 será processada pela Google Play ou App Store.'
        : 'A compra vitalícia de R$149,90 será processada pela Google Play ou App Store.',
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-4 py-4 flex items-center gap-2">
        <img src={logoIcon} alt="EnxaqueCare" className="w-8 h-8" />
        <span className="font-serif font-bold text-lg">EnxaqueCare</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 max-w-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
            Seu período de teste expirou
          </h1>
          <p className="text-muted-foreground text-sm">
            Escolha um plano para continuar usando o EnxaqueCare e cuidar da sua saúde.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-md mb-6"
        >
          <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="w-full max-w-md space-y-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card
              className="cursor-pointer border-2 border-primary/30 hover:border-primary transition-colors"
              onClick={() => handlePurchase('monthly')}
            >
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Mensal
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">Popular</Badge>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">R$4,90</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Cancele quando quiser</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card
              className="cursor-pointer border-2 border-transparent hover:border-primary/50 transition-colors"
              onClick={() => handlePurchase('lifetime')}
            >
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Infinity className="w-4 h-4 text-primary" />
                    Vitalício
                  </CardTitle>
                  <Badge className="text-xs bg-primary/10 text-primary border-primary/20">Melhor valor</Badge>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">R$149,90</span>
                  <span className="text-sm text-muted-foreground">único</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Pague uma vez, use para sempre</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <p className="text-xs text-muted-foreground mt-6 text-center max-w-sm">
          O pagamento será processado pela Google Play ou App Store.
          Ao assinar, você concorda com os{' '}
          <a href="https://enxaquecare.com/termosdeuso" target="_blank" rel="noopener noreferrer" className="text-primary underline">
            Termos de Uso
          </a>.
        </p>
      </main>
    </div>
  );
};

export default Paywall;
