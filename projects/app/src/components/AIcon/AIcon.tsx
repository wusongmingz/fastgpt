import { Box, BoxProps } from '@chakra-ui/react';
interface AIconProps extends BoxProps {
  name: string;
  refname?: React.Ref<HTMLDivElement>;
  fontSize?: string;
  color?: string;
}

export default function AIcon({ name, fontSize = '20px', ...props }: AIconProps) {
  return (
    <Box
      className={`iconfont iconstyle ${name}`}
      fontSize={fontSize}
      // w={fontSize}
      h={fontSize}
      lineHeight={'normal'}
      ref={props.refname}
      {...props}
    ></Box>
  );
}
