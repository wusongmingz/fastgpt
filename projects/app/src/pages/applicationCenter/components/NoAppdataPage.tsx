import { Box, Flex, useDisclosure } from '@chakra-ui/react';
import { AppListContext } from '../../app/list/components/context';
import AIcon from '@/components/AIcon/AIcon';
import CreateFolderOrApp from './CreateFolderOrApp';
import { useContextSelector } from 'use-context-selector';

export default function NoAppdataPage() {
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { myApps, parentId } = useContextSelector(AppListContext, (v) => v);
  return (
    <Flex
      flex={1}
      h={'100%'}
      p={'8px'}
      gap={'15px'}
      {...(myApps.length === 0 && parentId
        ? {
            alignItems: 'center',
            justifyContent: 'center'
          }
        : '')}
    >
      {myApps.length == 0 && !parentId && (
        <Box
          w={'450px'}
          h={'300px'}
          borderRadius={'md'}
          bgImage={'/imgs/images/picture/shutterstock_587628377.jpg'}
          bgSize={'cover'}
          boxShadow={'10px 10px 4px rgba(0,0,0,0.4)'}
        >
          <AIcon
            name="icon-biaoqian1"
            fontSize={'30px'}
            cursor={'pointer'}
            color={'rgb(0,47,167)'}
            onClick={() => {
              onCreateOpen();
            }}
          ></AIcon>
        </Box>
      )}
      <Flex
        w={'340px'}
        h={'300px'}
        borderRadius={'md'}
        bgImage={'/imgs/images/picture/页面_1.png'}
        bgSize={'cover'}
        position={'relative'}
        boxShadow={'10px 10px 4px rgba(0,0,0,0.4)'}
        onClick={() => {
          onCreateOpen();
        }}
        cursor={'pointer'}
      >
        <AIcon
          name="icon-biaoqian1"
          color={'rgb(0,47,167)'}
          fontSize={'30px'}
          position={'absolute'}
        ></AIcon>
        <AIcon name="icon-xinzeng" fontSize={'60px'} m={'auto'} color={'primary.500'}></AIcon>
      </Flex>
      <CreateFolderOrApp isOpen={isCreateOpen} onClose={onCreateClose}></CreateFolderOrApp>
    </Flex>
  );
}
