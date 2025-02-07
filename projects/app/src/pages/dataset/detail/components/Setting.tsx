import { Box, Flex, FlexProps, Image, IconButton } from '@chakra-ui/react';
import MetaDataCard from './MetaDataCard';
// import Info from './Info';
import Infos from './infos';
import MyBox from '@fastgpt/web/components/common/MyBox';

export default function Setting({ datasetId }: { datasetId: string }) {
  //   const sliderStyles: FlexProps = {
  //     bg: 'white',
  //     borderRadius: 'md',
  //     overflowY: 'scroll',
  //     boxShadow: 2
  //   };
  return (
    <>
      {/* <Flex flex={'0 0 20rem'}>
        <MetaDataCard datasetId={datasetId} />
      </Flex> */}

      <MyBox h={'100%'} w={'70%'} minW={'700px'}>
        <Flex flex={'0 0 17rem'}>
          <Infos datasetId={datasetId} />
        </Flex>
      </MyBox>
    </>
  );
}
