import { useMediaQuery } from '@chakra-ui/react';

export const useSystem = () => {
  // const [isPc] = useMediaQuery('(min-width: 900px)');
  const isPc = true;

  return { isPc };
};
