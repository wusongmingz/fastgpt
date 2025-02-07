import { useDisclosure, Collapse } from '@chakra-ui/react';
import { ReactNode } from 'react';

export function ACollapse({
  children,
  trigger
}: {
  children: ReactNode;
  trigger: ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => ReactNode;
}) {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <>
      {trigger({ isOpen, onToggle })}
      <Collapse in={isOpen} animateOpacity>
        {children}
      </Collapse>
    </>
  );
}
