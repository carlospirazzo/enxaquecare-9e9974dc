import { X, Moon, MessageCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { MigraineEpisode } from '@/types/migraine';
import { useSmartNotifications } from '@/hooks/useSmartNotifications';

interface Props {
  episodes: MigraineEpisode[];
}

const icons = {
  sleep: Moon,
  inactive: MessageCircle,
  med_overuse: AlertTriangle,
};

const bgClasses = {
  sleep: 'bg-accent border-primary/20',
  inactive: 'bg-accent border-primary/20',
  med_overuse: 'bg-destructive/10 border-destructive/30',
};

export function SmartNotifications({ episodes }: Props) {
  const { notifications, dismiss } = useSmartNotifications(episodes);

  return (
    <AnimatePresence>
      {notifications.map(n => {
        const Icon = icons[n.type];
        return (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className={`rounded-xl border p-3 flex items-start gap-3 ${bgClasses[n.type]}`}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{n.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => dismiss(n.id)}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}
