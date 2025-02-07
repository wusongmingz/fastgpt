import { Box } from '@chakra-ui/react';
import { serviceSideProps } from '@/web/common/utils/i18n';
export default function Plugins() {
  return (
    <>
      <Box h={60} w={'400px'} p={1} overflow={'auto'} bgColor={'white'}>
        <Box h={'800px'} bgColor={'yellow'}></Box>
      </Box>
    </>
  );
}
export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content, ['app', 'user']))
    }
  };
}
