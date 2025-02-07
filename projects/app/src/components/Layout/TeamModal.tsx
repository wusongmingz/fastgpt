import { TeamType } from '@/global/core/chat/api';
import { Flex, Image, ModalBody, Text } from '@chakra-ui/react';
import MyModal from '@fastgpt/web/components/common/MyModal';
import { useConfirm } from '@fastgpt/web/hooks/useConfirm';
import { useTranslation } from 'react-i18next';
import TeamList from '../support/user/team/TeamManageModal/TeamList';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import AIcon from '../AIcon/AIcon';
export default function TeamModal({
  onClose,
  teamList,
  defaultTeam,
  openEditConfirm
}: {
  onClose: () => void;
  defaultTeam: TeamType | undefined;
  teamList: TeamType[] | undefined;
  openEditConfirm: any;
}) {
  const { t } = useTranslation();
  // const { data: teamList } = useRequest2(
  //   () => {
  //     return GET<TeamType[]>('/support/user/team/group/list');
  //   },
  //   {
  //     manual: false
  //   }
  // );
  return (
    <>
      <MyModal
        onClose={onClose}
        title={<Text fontSize={'14px'}>{t('common:now.local.team')}</Text>}
        titleBgc="#e2e3ea"
        overflow={'hidden'}
      >
        <ModalBody p={0} minH={'200px'} maxH={'250px'} overflow={'auto'}>
          {teamList &&
            teamList.map((item) => {
              return (
                <Flex
                  alignItems={'center'}
                  key={item.name}
                  py={2}
                  px={8}
                  cursor={'pointer'}
                  _hover={{
                    bg: '#f7f8fa'
                  }}
                  onClick={() => {
                    openEditConfirm(item);
                    onClose();
                  }}
                  borderBottom={'1px solid #e2e3ea'}
                  // _notLast={{ borderBottom: '1px solid #e2e3ea' }}
                >
                  <Image
                    src={item.avatar || '/imgs/tianyuanlogo.png'}
                    alt=""
                    w={'30px'}
                    borderRadius={'50%'}
                  ></Image>
                  <Text flex={1} textAlign={'center'} maxW={'200px'}>
                    {item.name}
                  </Text>
                  {/* {//todo 选择就√} */}
                  {defaultTeam?._id == item._id && (
                    <AIcon name="icon-tijiao" color="primary.500"></AIcon>
                  )}
                </Flex>
              );
            })}
        </ModalBody>
      </MyModal>
    </>
  );
}
