import React, { useCallback, useState } from 'react';
import { AppTypeEnum } from '@fastgpt/global/core/app/constants';
import { emptyTemplates } from '@/web/core/app/templates';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { postCreateApp } from '@/web/core/app/api';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Loading from '../../../../../../packages/web/components/common/MyLoading/index';
import { postCreateAppFolder } from '@/web/core/app/api/app';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  RadioGroup,
  Stack,
  Radio,
  Button,
  Input,
  Box,
  Text,
  Spinner,
  Flex,
  FormControl,
  FormLabel,
  Textarea,
  Center
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useContextSelector } from 'use-context-selector';
import { AppListContext } from '../../app/list/components/context';
interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}
type FormType = {
  avatar: string;
  appName: string;
  type: AppTypeEnum.workflow | AppTypeEnum.simple | AppTypeEnum.plugin;
  desc: string;
  template: string;
  selectColor: string;
};

const colors = [
  '#002FA7',
  '#008C8C',
  '#003153',
  '#81D8CF',
  '#B05923',
  '#900021',
  '#E60000',
  '#FBD26A',
  '#432913',
  '#E85827'
];

const FolderModal: React.FC<FolderModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const { parentId, loadMyApps } = useContextSelector(AppListContext, (v) => v);
  const [showNextPageValue, setShowNextPageValue] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
  const {
    register: folderRegister,
    handleSubmit: folderHandleSubmit,
    reset: floderReset
  } = useForm();
  const [currentSelectColor, setCurrentSelectColor] = useState(colors[0]);
  const {
    register: appRegister,
    handleSubmit: appHandleSubmit,
    setValue: setAppValue,
    reset: appReset
  } = useForm<FormType>({
    defaultValues: {
      selectColor: colors[0]
    }
  });
  const submitCreateFolderModal = useCallback(() => {
    folderHandleSubmit((data) => {
      if (data.folderName.trim() === '') {
        toast({
          title: t('common:common.name cant empty'),
          duration: 2000,
          status: 'warning',
          position: 'top'
        });
        return;
      }
      onCreateFolder(data);
    })();
  }, [folderHandleSubmit, onClose]);
  const submitCreateModal = useCallback(() => {
    appHandleSubmit((data) => {
      if (data.appName.trim() === '') {
        toast({
          title: t('common:common.name cant empty'),
          duration: 2000,
          status: 'warning',
          position: 'top'
        });
        return;
      }
      onclickCreate(data);
    })();
  }, [onClose, appHandleSubmit]);
  const buttonStyles = {
    cancelButtonStyle: {
      bg: 'white',
      w: '100px',
      h: '32px',
      color: 'black',
      border: '1px solid #d6d7ef',
      borderRadius: '5px',
      _hover: {
        bg: 'rgb(237,241,244)',
        color: 'black'
      }
    },
    okButtonStyle: {
      bg: 'black',
      color: 'white',
      w: '100px',
      h: '32px',
      borderRadius: '5px',
      border: '1px solid black',
      _hover: {
        bg: 'rgb(237,241,244)',
        color: 'black',
        border: '1px solid black'
      }
    }
  };
  const modalStyles = {
    modalHeader: {
      borderBottom: '1px solid #E2E8F0',
      bg: '#e2e3ea',
      borderRadius: '10px 10px 0 0',
      fontSize: '13px',
      p: '10px 10px 10px 15px'
    },
    modalFooter: {
      borderTop: '1px solid #d6d7ef',
      h: '60px',
      pb: 0,
      pr: '20px',
      alignItems: 'center'
    }
  };
  const handleValueChange = (val: string) => {
    setShowNextPageValue(val);
  };
  const createTypes = [
    {
      title: '文件夹',
      type: AppTypeEnum.folder
    },
    {
      title: t('app:type.Simple bot'),
      type: AppTypeEnum.simple,
      desc: t('common:common.input form create app')
    },
    {
      title: '工作流',
      type: AppTypeEnum.workflow,
      desc: t('common:common.input low code app')
    },
    {
      title: '插件',
      type: AppTypeEnum.plugin,
      desc: t('common:common.diy input and output')
    }
  ];
  const [currentSelectTemplate, setCurrentSelectTemplate] = useState('blank');
  const [currentSelectOperation, setCurrentSelectOperation] = useState('');
  const handleNextStep = () => {
    if (!showNextPageValue) {
      return;
    }
    if (showNextPageValue === AppTypeEnum.folder) {
      setShowAppModal(false);
      setShowFolderModal(true);
    } else {
      setShowFolderModal(false);
      switch (showNextPageValue) {
        case AppTypeEnum.simple:
          setAppValue('type', AppTypeEnum.simple);
          setCurrentSelectOperation('应用');
          break;
        case AppTypeEnum.workflow:
          setAppValue('type', AppTypeEnum.workflow);
          setCurrentSelectOperation('工作流');
          break;
        case AppTypeEnum.plugin:
          setAppValue('type', AppTypeEnum.plugin);
          setCurrentSelectOperation('插件');
          break;
      }
      setShowAppModal(true);
    }
  };
  const cleanData = () => {
    setShowFolderModal(false);
    setShowAppModal(false);
    appReset();
    floderReset();
    setCurrentSelectOperation('');
    setShowNextPageValue('');
    setCurrentSelectTemplate('blank');
  };
  //创建app
  const createAvatars = {
    [AppTypeEnum.simple]: '/imgs/app/avatar/simple.svg',
    [AppTypeEnum.workflow]: '/imgs/app/avatar/workflow.svg',
    [AppTypeEnum.plugin]: '/imgs/app/avatar/plugin.svg'
  };
  const [apptype, setApptype] = useState('');
  const { runAsync: onclickCreate, loading: isCreating } = useRequest2(
    async (data: FormType, templateId?: string) => {
      // if (!templateId) {
      setApptype(data.type);

      return postCreateApp({
        parentId,
        avatar: createAvatars[data.type],
        name: data.appName.trim(),
        type: data.type,
        intro: data.desc.trim(),
        modules: emptyTemplates[data.type].nodes,
        edges: emptyTemplates[data.type].edges,
        selectColor: data.selectColor,
        chatConfig: emptyTemplates[data.type].chatConfig
      });
      // }

      // const templateDetail = await getTemplateMarketItemDetail({ templateId: templateId });

      // return postCreateApp({
      //   parentId,
      //   avatar: data.avatar || templateDetail.avatar,
      //   name: data.name,
      //   type: templateDetail.type,
      //   modules: templateDetail.workflow.nodes || [],
      //   edges: templateDetail.workflow.edges || [],
      //   chatConfig: templateDetail.workflow.chatConfig
      // });
    },
    {
      onSuccess(id: string) {
        router.push(`/app/detail?appId=${id}&appType=${apptype}`);
        loadMyApps();
        onClose();
      },
      successToast: t('common:common.Create Success'),
      errorToast: t('common:common.Create Failed')
    }
  );
  //创建文件夹
  const { runAsync: onCreateFolder, loading: isCreatingFolder } = useRequest2(
    async (data) => {
      if (!parentId) {
        return postCreateAppFolder({
          name: data.folderName.trim(),
          intro: data.folderDesc.trim()
        });
      }
      return postCreateAppFolder({
        parentId,
        name: data.folderName.trim(),
        intro: data.folderDesc.trim()
      });
    },
    {
      onSuccess() {
        loadMyApps();
        cleanData();
        onClose();
      },
      successToast: t('common:common.Create Success'),
      errorToast: 'Error'
    }
  );
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          cleanData();
          onClose();
        }}
        isCentered
        size="lg"
      >
        <ModalOverlay />
        {!showAppModal && !showFolderModal ? (
          <ModalContent borderRadius="10px" h="500px" w="500px">
            <ModalHeader {...modalStyles.modalHeader}>&nbsp;</ModalHeader>
            <ModalCloseButton />
            <ModalBody display="flex" justifyContent="center" alignItems="center">
              <RadioGroup onChange={handleValueChange} value={showNextPageValue}>
                <Stack gap={'20px'}>
                  {createTypes.map((item) => {
                    return (
                      <Radio value={item.type} size="lg" key={item.type}>
                        <Stack w={'200px'} pl={'16px'}>
                          <Text textAlign={'center'} fontSize={'15px'} fontWeight={600}>
                            {item.title}
                          </Text>
                          <Text fontSize={'12px'}>{item.desc || ''}</Text>
                        </Stack>
                      </Radio>
                    );
                  })}
                </Stack>
              </RadioGroup>
            </ModalBody>
            <ModalFooter
              borderTop={'1px solid #d6d7ef'}
              h={'60px'}
              pb={0}
              pr={'20px'}
              alignItems={'center'}
            >
              <Flex gap={'20px'}>
                <Button
                  {...buttonStyles.cancelButtonStyle}
                  onClick={() => {
                    cleanData();
                    onClose();
                  }}
                >
                  取消
                </Button>
                <Button {...buttonStyles.okButtonStyle} onClick={handleNextStep}>
                  下一步
                </Button>
              </Flex>
            </ModalFooter>
          </ModalContent>
        ) : showFolderModal && !showAppModal ? (
          <FormControl>
            <ModalContent borderRadius="10px" h="500px" w="500px">
              <ModalHeader {...modalStyles.modalHeader}>创建文件夹</ModalHeader>
              <ModalCloseButton />
              <ModalBody
                display="flex"
                flexDirection={'column'}
                alignItems={'center'}
                justifyContent="center"
                pb={'80px'}
                gap={'5px'}
              >
                {isCreatingFolder && <Loading fixed={false} />}
                <Box>
                  <FormLabel fontSize={'13px'} pl={'10px'}>
                    *请输入文件夹名称
                  </FormLabel>
                  <Input
                    w={'300px'}
                    focusBorderColor="primary.500 "
                    {...folderRegister('folderName', { required: true })}
                  ></Input>
                </Box>
                <Box>
                  <FormLabel fontSize={'13px'} pl={'10px'}>
                    描述
                  </FormLabel>
                  <Textarea
                    resize={'none'}
                    w={'300px'}
                    h={'120px'}
                    {...folderRegister('folderDesc')}
                    focusBorderColor="primary.500 "
                  ></Textarea>
                </Box>
              </ModalBody>
              <ModalFooter {...modalStyles.modalFooter}>
                <Flex gap={'20px'}>
                  <Button
                    {...buttonStyles.cancelButtonStyle}
                    onClick={() => {
                      cleanData();
                      onClose();
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    {...buttonStyles.okButtonStyle}
                    onClick={() => {
                      submitCreateFolderModal();
                    }}
                  >
                    提交
                  </Button>
                </Flex>
              </ModalFooter>
            </ModalContent>
          </FormControl>
        ) : (
          <ModalContent borderRadius="10px" h="500px" w="500px">
            <ModalHeader {...modalStyles.modalHeader}>
              {showNextPageValue === AppTypeEnum.simple
                ? '  创建简易应用'
                : showNextPageValue === AppTypeEnum.workflow
                  ? '创建工作流'
                  : '创建插件'}
            </ModalHeader>
            <ModalCloseButton />
            {isCreating && <Loading fixed={false} />}
            <ModalBody
              display="flex"
              flexDirection={'column'}
              alignItems={'center'}
              justifyContent="center"
              position="relative"
              gap={'5px'}
              pb={0}
              pt={0}
            >
              <Box>
                <FormLabel w={'350px'} fontSize={'13px'} pl={'10px'}>
                  *{currentSelectOperation}的名字（限制10字内）
                </FormLabel>
                <Input
                  w={'350px'}
                  maxLength={10}
                  focusBorderColor="primary.500 "
                  {...appRegister('appName', { required: true })}
                ></Input>
              </Box>
              <FormLabel w={'350px'} fontSize={'13px'} pl={'10px'}>
                {currentSelectOperation}描述（限制20字内）
              </FormLabel>
              <Textarea
                resize={'none'}
                w={'350px'}
                h={'120px'}
                maxLength={20}
                {...appRegister('desc', { required: false })}
                focusBorderColor="primary.500 "
              ></Textarea>
              <Box w={'100%'} pl={'25px'}>
                <FormLabel w={'350px'} fontSize={'13px'} pl={'10px'}>
                  *选择应用模板
                </FormLabel>
                <RadioGroup
                  onChange={(val) => {
                    setCurrentSelectTemplate(val);
                  }}
                  value={currentSelectTemplate}
                  gap={'15px'}
                >
                  <Radio value={'blank'} size={'lg'}>
                    <Box
                      w={'160px'}
                      h={'85px'}
                      borderRadius={'5px'}
                      borderWidth={'1px'}
                      borderColor={'#d6d7ef'}
                      alignContent={'center'}
                      p={'5px'}
                    >
                      <Text
                        fontSize={'13px'}
                        color={'black'}
                        pb={'3px'}
                        textAlign={'center'}
                        fontWeight={800}
                      >
                        创建空白{currentSelectOperation}
                      </Text>
                    </Box>
                  </Radio>
                </RadioGroup>
              </Box>
              <Input
                type="hidden"
                value={currentSelectTemplate}
                {...appRegister('template', { required: true })}
              ></Input>
              <FormLabel w={'350px'} fontSize={'13px'} pl={'10px'}>
                *选择知识库标签颜色
              </FormLabel>
              <Flex gap={'8px'}>
                {colors.map((item) => {
                  return (
                    <Box
                      w={'30px'}
                      h={'30px'}
                      cursor={'pointer'}
                      key={item}
                      bgColor={item}
                      _hover={{
                        borderColor: '#d6d7ef',
                        borderWidth: '2px'
                      }}
                      {...(currentSelectColor === item
                        ? {
                            borderColor: '#d6d7ef',
                            borderWidth: '2px'
                          }
                        : '')}
                      onClick={() => {
                        setCurrentSelectColor(item);
                        setAppValue('selectColor', item);
                      }}
                    ></Box>
                  );
                })}
              </Flex>
            </ModalBody>
            <ModalFooter {...modalStyles.modalFooter}>
              <Flex gap={'20px'}>
                <Button
                  {...buttonStyles.cancelButtonStyle}
                  onClick={() => {
                    cleanData();
                    onClose();
                  }}
                >
                  取消
                </Button>
                <Button {...buttonStyles.okButtonStyle} onClick={submitCreateModal}>
                  确认
                </Button>
              </Flex>
            </ModalFooter>
          </ModalContent>
        )}
      </Modal>
    </>
  );
};

export default FolderModal;
