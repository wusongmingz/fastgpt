import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
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
  FormLabel,
  Textarea,
  Center,
  Flex,
  // Select,
  Menu
} from '@chakra-ui/react';
import AIcon from '@/components/AIcon/AIcon';
import Loading from '../../../../../../../packages/web/components/common/MyLoading/index';
import { selectAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/react';
import { useRequest2 } from '../../../../../../../packages/web/hooks/useRequest';
import { useTranslation } from 'next-i18next';
import { postCreateDataset } from '@/web/core/dataset/api';
import type { CreateDatasetParams } from '@/global/core/dataset/api.d';
import { DatasetTypeEnum } from '@fastgpt/global/core/dataset/constants';
import { useRouter } from 'next/router';
import { useContextSelector } from 'use-context-selector';
import { DatasetsContext } from '../../list/context';
import { useRequest } from '@fastgpt/web/hooks/useRequest';
import { postCreateDatasetFolder, resumeInheritPer } from '@/web/core/dataset/api';
import CostTooltip from '@/components/core/app/plugin/CostTooltip';
import { Select } from 'chakra-react-select';
import { log } from 'console';
interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FolderModal: React.FC<FolderModalProps> = ({ isOpen, onClose }) => {
  const { loadMyDatasets, refetchPaths } = useContextSelector(DatasetsContext, (v) => v);
  const [value, setValue] = useState('');
  const [valueStyle, setValueStyle] = useState('dataset');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
  const router = useRouter();
  const { parentId } = router.query as { parentId: string };
  const { register: datasetRegister, handleSubmit: datasetHandleSubmit, reset } = useForm();
  const [selectedValue, setSelectedValue] = useState<string | undefined>('Qwen2:7B');
  const [selectText, setSelectText] = useState<string | undefined>('Qwen-long');
  const [selectColor, setSelectColor] = useState<string | undefined>('#002FA7');
  // const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  //   setSelectedValue(event.target.value);
  // };
  // const handleChangeText = (event: React.ChangeEvent<HTMLSelectElement>) => {
  //   setSelectText(event.target.value);
  // };
  const {
    register: folderRegister,
    handleSubmit: folderHandleSubmit,
    reset: folderReset
  } = useForm();
  const { t } = useTranslation();
  const createDataset = async () => {
    await datasetHandleSubmit(async (data) => {
      // console.log(data);

      const datasetParams: CreateDatasetParams = {
        parentId: parentId || undefined, // 如果有父ID，填入此处
        // type: DatasetTypeEnum.dataset,
        type: valueStyle as unknown as DatasetTypeEnum,
        name: data.knowledgeName, // 替换为实际名称
        intro: data.knowledgeDesc, // 替换为实际简介
        avatar: 'core/dataset/commonDatasetColor', // 替换为实际头像路径
        vectorModel: selectedValue, // 替换为实际向量模型
        agentModel: selectText, // 替换为实际代理模型
        selectColor: selectColor
      };
      // console.log(datasetParams, 21212121);

      try {
        const datasetId = await postCreateDataset(datasetParams);
        // console.log('创建成功,数据集ID:', datasetId);
        loadMyDatasets();
        onClose();
        setShowFolderModal(false);
        setShowKnowledgeModal(false);
        reset();

        router.push(`/dataset/detail?datasetId=${datasetId}`);
      } catch (error) {
        console.error('创建失败:', error);
      }
    })();
  };

  const { mutate: onClickCraete, isLoading: creating } = useRequest({
    mutationFn: createDataset,
    successToast: t('common:common.Create Success'),
    errorToast: t('common:common.Create Failed')
  });

  // 创建文件夹请求// 定义提交类型
  type CommitType = {
    name: string; // 必填名称
    intro?: string; // 可选简介
  };
  const onCreate = async ({ name, intro }: CommitType) => {
    try {
      await postCreateDatasetFolder({
        parentId: parentId || undefined,
        name,
        intro: intro ?? ''
      });
      // loadMyDatasets();
      // refetchPaths();
    } catch (error) {
      return Promise.reject(error);
    }
  };
  const { run: onSave, loading: isCreatingFolder } = useRequest2(
    ({ folderName = '', folderDesc }: any) => {
      if (!folderName) return Promise.reject('名称不能为空');
      return onCreate({ name: folderName, intro: folderDesc }); // 创建模式
    },
    {
      onSuccess: () => {
        loadMyDatasets();
        onClose();
        setShowFolderModal(false);
        setShowKnowledgeModal(false);
        folderReset();
      },
      successToast: t('common:common.Create Success'),

      errorToast: t('common:common.Create Failed')
    }
  );

  const handleValueChange = (val: string) => {
    setValue(val);
  };

  const handleValueStyleChange = (val: string) => {
    setValueStyle(val);
  };
  const [isHovered, setIsHovered] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  const handleMouseEnter2 = () => {
    setIsHovered2(true);
  };

  const handleMouseLeave2 = () => {
    setIsHovered2(false);
  };

  const handleNextStep = () => {
    if (value === 'folder') {
      setShowKnowledgeModal(false);
      setShowFolderModal(true);
    } else if (value === 'knowledge') {
      setShowFolderModal(false);
      setShowKnowledgeModal(true);
    }
  };

  const handleClose = () => {
    onClose();
    setShowFolderModal(false);
    setShowKnowledgeModal(false);
    folderReset();
    reset();
    setSelectColor('#002FA7');
  };

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
  const chakraStyles = {
    container: (prev: any) => ({
      ...prev,
      w: '240px',
      maxH: '32px'
    }),

    option: (provided: any, { isSelected }: { isSelected: any }) => ({
      ...provided,
      _hover: {
        color: '#d7000f',
        bg: '#f7f8fa'
      },
      backgroundColor: '#fff',
      ...(isSelected && {
        backgroundColor: '#fff',
        color: '#d7000f'
      })
    }),
    dropdownIndicator: (prev: any, { selectProps }: any) => ({
      ...prev, // w: '120px',
      '> svg': {
        transform: `rotate(${selectProps.menuIsOpen ? 90 : 0}deg)`,
        transition: 'transform 0.3s'
      }
    })
  };

  const modalStyles = {
    modalHeader: {
      borderBottom: '1px solid #E2E8F0',
      bg: '#e2e3ea',
      borderRadius: '10px 10px 0 0',
      fontSize: '13px',
      p: '10px 10px 5px 15px'
    },
    modalFooter: {
      borderTop: '1px solid #d6d7ef',
      h: '60px',
      pb: 0,
      pr: '20px',
      alignItems: 'center'
    }
  };
  const renderModalContent = (
    headerText: string,
    bodyContent: React.ReactNode
    // footerLink: string
  ) => (
    <ModalContent borderRadius="10px" h={value === 'knowledge' ? '650px' : '450px'} w="520px">
      <Box borderBottom="1px solid #E2E8F0" py={1} bg="#e2e3ea" borderRadius="10px 10px 0 0">
        <ModalHeader {...modalStyles.modalHeader}>{headerText}</ModalHeader>
      </Box>
      <ModalCloseButton />
      <ModalBody py={6}>{bodyContent}</ModalBody>
      <ModalFooter {...modalStyles.modalFooter}>
        <Box style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
          <Button onClick={handleClose} {...buttonStyles.cancelButtonStyle}>
            取消
          </Button>
          {/* <Link href={footerLink}> */}
          <Button
            {...buttonStyles.okButtonStyle}
            isLoading={value === 'knowledge' ? creating : isCreatingFolder}
            onClick={() => {
              if (value === 'knowledge') {
                datasetHandleSubmit((data) => {
                  // console.log(creating);
                  onClickCraete(data);
                })();
              } else if (value === 'folder') {
                // folderHandleSubmit((data) => {
                //   // console.log(creating);
                //   console.log(data);
                // })();
                folderHandleSubmit((data) => {
                  onSave(data);
                })();
              }
            }}
          >
            确认
          </Button>
          {/* </Link> */}
        </Box>
      </ModalFooter>
    </ModalContent>
  );

  return (
    <>
      {!showFolderModal && !showKnowledgeModal ? (
        <Modal isOpen={isOpen} onClose={handleClose} isCentered size="lg">
          <ModalOverlay />
          <ModalContent borderRadius="10px" h="450px" w="520px">
            <Box borderBottom="1px solid #E2E8F0" py={1} bg="#e2e3ea" borderRadius="10px 10px 0 0">
              <ModalHeader {...modalStyles.modalHeader}>&nbsp;</ModalHeader>
            </Box>
            <ModalCloseButton />
            <ModalBody py={6} display="flex" justifyContent="center" alignItems="center">
              <RadioGroup onChange={handleValueChange} value={value}>
                <Stack>
                  <Radio value="folder" size="lg">
                    文件夹
                  </Radio>
                  <Radio value="knowledge" size="lg">
                    知识库
                  </Radio>
                </Stack>
              </RadioGroup>
            </ModalBody>
            <ModalFooter {...modalStyles.modalFooter}>
              <Box style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                <Button onClick={handleClose} {...buttonStyles.cancelButtonStyle}>
                  取消
                </Button>
                <Button {...buttonStyles.okButtonStyle} onClick={handleNextStep}>
                  下一步
                </Button>
              </Box>
            </ModalFooter>
          </ModalContent>
        </Modal>
      ) : showFolderModal ? (
        <Modal isOpen={showFolderModal} onClose={handleClose} isCentered size="lg">
          <ModalOverlay />
          {renderModalContent(
            '创建文件夹',
            <Flex direction={'column'} justifyContent={'center'} alignItems={'center'}>
              {isCreatingFolder && <Loading fixed={false} />}
              <Box pb="20px">
                <FormLabel fontSize={'13px'} pl={'10px'}>
                  *请输入文件夹名称
                </FormLabel>
                <Input
                  w={'300px'}
                  maxLength={10}
                  focusBorderColor="primary.500 "
                  {...folderRegister('folderName', {
                    required: '名称不能为空',
                    validate: (value) => {
                      const trimmedValue = value.trim();
                      if (trimmedValue === '') {
                        return '名称不能为空且不能包含空格';
                      }
                      return true;
                    }
                  })}
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
                  maxLength={20}
                  // {...folderRegister('folderDesc', { required: true })}
                  {...folderRegister('folderDesc')}
                  focusBorderColor="primary.500 "
                ></Textarea>
              </Box>
            </Flex>
            // '/dataset/list'
          )}
        </Modal>
      ) : (
        <Modal isOpen={showKnowledgeModal} onClose={handleClose} isCentered size="lg">
          <ModalOverlay />
          {renderModalContent(
            '创建知识库',
            <>
              <FormLabel fontSize={'13px'} pl={'10px'}>
                *请输入知识库名称
              </FormLabel>
              <Input
                placeholder=""
                maxLength={10}
                {...datasetRegister('knowledgeName', {
                  required: '知识库名称不能为空',
                  validate: (value) => {
                    const trimmedValue = value.trim();
                    if (trimmedValue === '') {
                      return '知识库名称不能为空且不能包含空格';
                    }
                    if (trimmedValue.length > 10) {
                      return '知识库名称不能超过 10 个字';
                    }
                    return true;
                  }
                })}
              />
              <FormLabel fontSize={'13px'} pl={'10px'} mt={'5px'}>
                请输入知识库描述（20字以内）
              </FormLabel>
              <Textarea
                resize={'none'}
                w={'409px'}
                h={'100px'}
                {...datasetRegister('knowledgeDesc')}
                focusBorderColor="primary.500 "
                maxLength={20}
              ></Textarea>
              <FormLabel fontSize={'13px'} pl={'10px'} mt={'5px'}>
                *知识库类型
              </FormLabel>

              <RadioGroup onChange={handleValueStyleChange} value={valueStyle}>
                <Stack>
                  <Radio size="lg" value="dataset">
                    <Box border="1px solid #e2e3ea" borderRadius="5px" p={2}>
                      <Text fontSize="13px" fontWeight={'1000'}>
                        通用知识库
                      </Text>
                      <Text fontSize="sm" w={360} color={'gray'}>
                        可通过导入文件、网页链接或手动录入形式构建知识库
                      </Text>
                    </Box>
                  </Radio>
                  <Radio size="lg" value="graph">
                    <Box border="1px solid  #e2e3ea" borderRadius="5px" p={2}>
                      <Text fontSize="13px" fontWeight={'1000'}>
                        图知识库
                      </Text>
                      <Text fontSize="sm" w={360} color={'gray'}>
                        通过向量化建立节点,关系的联系将RAG准确度提高
                      </Text>
                    </Box>
                  </Radio>
                </Stack>
              </RadioGroup>
              <Box>
                <FormLabel
                  fontSize={'13px'}
                  // pl={'10px'}
                  mt={'5px'}
                  display={'flex'}
                  alignItems={'center'}
                  mr={0}
                >
                  索引模型
                  <Box
                    position="relative"
                    display="inline-block"
                    className="icon-with-tooltip" // 添加这个类名用于应用CSS样式和处理交互
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <AIcon name="icon-yingwenzhushi" ml={'5px'} />
                    <Box
                      position="absolute"
                      bottom="100%"
                      left="50%"
                      transform="translateY(160%)"
                      mb="5px"
                      bg="white"
                      color="gray"
                      p="5px"
                      borderRadius="5px"
                      whiteSpace="nowrap"
                      className="icon-tooltip" // 添加这个类名用于应用CSS样式
                      style={{
                        visibility: isHovered ? 'visible' : 'hidden',
                        opacity: isHovered ? 1 : 0,
                        zIndex: 9999
                      }}
                    >
                      索引模型可以将自然语言转成向量，用于进行语义检索
                      <br />
                      注意:不同索引模型不能一起使用，选择索引模型后将无法修改。
                    </Box>
                  </Box>
                  <Box ml={'90px'}>
                    {/* <Select
                      placeholder="Qwen2:7B"
                      size="sm"
                      width="220px"
                      value={selectedValue}
                      // onChange={handleChange}
                    >
                      <option value="Qwen2:0.5B" className="select">
                        Qwen2:0.5B
                      </option>
                      <option value="Yi:34B">Yi:34B</option>
                      <option value="GLM-4-9B">GLM-4-9B</option>
                    </Select> */}
                    <Select
                      chakraStyles={chakraStyles}
                      size={'sm'}
                      placeholder="nomic-embed-text:latest"
                      // value={'Qwen2:7B'}
                      // onChange={handleChange}
                      onChange={(e) => {
                        setSelectedValue(e?.value);
                      }}
                      options={[
                        {
                          value: 'nomic-embed-text:latest',
                          label: 'nomic-embed-text:latest'
                        },
                        {
                          value: 'mxbai-embed-large:latest',
                          label: 'mxbai-embed-large:latest'
                        },

                        {
                          value: 'glm4:latest',
                          label: 'glm4:latest'
                        }
                      ]}
                      formatOptionLabel={(data) => {
                        return (
                          <>
                            <Flex w={'100%'} justifyContent={'space-between'} minWidth="200px">
                              <Text>{data.label}</Text>
                            </Flex>
                          </>
                        );
                      }}
                    ></Select>
                  </Box>
                </FormLabel>
              </Box>

              <FormLabel
                fontSize={'13px'}
                // pl={'10px'}
                mt={'5px'}
                display={'flex'}
                alignItems={'center'}
                mr={0}
              >
                文本理解模型
                <Box
                  position="relative"
                  display="inline-block"
                  className="icon-with-tooltip" // 添加这个类名用于应用CSS样式和处理交互
                  onMouseEnter={handleMouseEnter2}
                  onMouseLeave={handleMouseLeave2}
                >
                  <AIcon name="icon-yingwenzhushi" ml={'5px'} />
                  <Box
                    position="absolute"
                    bottom="100%"
                    left="50%"
                    transform="translateY(200%)"
                    mb="5px"
                    bg="white"
                    color="gray"
                    p="5px"
                    borderRadius="5px"
                    whiteSpace="nowrap"
                    className="icon-tooltip" // 添加这个类名用于应用CSS样式
                    style={{
                      visibility: isHovered2 ? 'visible' : 'hidden',
                      opacity: isHovered2 ? 1 : 0,
                      zIndex: 9999
                    }}
                  >
                    用于增强索引和QA生成
                  </Box>
                </Box>
                <Box ml={'63px'}>
                  {/* <Select
                    // chakraStyles={chakraStyles}
                    placeholder="Qwen-long"
                    size="sm"
                    width="200px"
                    value={selectText}
                    // onChange={handleChangeText}
                  >
                    <option value="Qwen2:0.5B">Qwen2:0.5B</option>
                    <option value="Gpt-35-turbo">Gpt-35-turbo</option>
                    <option value="Qwen:14B">Qwen:14B</option>
                  </Select> */}
                  <Select
                    chakraStyles={chakraStyles}
                    size={'sm'}
                    placeholder="qwen2.5:14b"
                    onChange={(e) => {
                      // handleChangeText(e);
                      // console.log(e?.value);
                      setSelectText(e?.value);
                    }}
                    options={[
                      {
                        value: 'qwen2.5:14b',
                        label: 'qwen2.5:14b'
                      },
                      {
                        value: 'yi:9b',
                        label: 'yi:9b'
                      },
                      {
                        value: 'yi:34b',
                        label: 'yi:34b'
                      },
                      {
                        value: 'qwen2.5:7b',
                        label: 'qwen2.5:7b'
                      }
                    ]}
                    formatOptionLabel={(data) => {
                      return (
                        <>
                          <Flex w={'100%'} justifyContent={'space-between'} minWidth="200px">
                            <Text>{data.label}</Text>
                          </Flex>
                        </>
                      );
                    }}
                  ></Select>
                </Box>
              </FormLabel>

              <FormLabel fontSize={'13px'} mt={'5px'}>
                *选择知识库标签颜色
              </FormLabel>
              <Box display="flex" justifyContent="space-between" mt={2}>
                {[
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
                ].map((color) => (
                  <Box
                    key={color}
                    bg={color}
                    w="30px"
                    h="30px"
                    cursor="pointer"
                    _hover={{
                      border: '2px solid gray'
                    }}
                    onClick={() => setSelectColor(color)}
                    border={selectColor === color ? '2px solid gray' : 'none'}
                  />
                ))}
              </Box>
            </>
            // '/dataset/list'
          )}
        </Modal>
      )}
    </>
  );
};

export default FolderModal;
