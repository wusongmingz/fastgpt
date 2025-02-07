import React, { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Stack
} from '@chakra-ui/react';
import { SmallAddIcon } from '@chakra-ui/icons';
import {
  VariableInputEnum,
  variableMap,
  WorkflowIOValueTypeEnum
} from '@fastgpt/global/core/workflow/constants';
import type { VariableItemType } from '@fastgpt/global/core/app/type.d';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useForm } from 'react-hook-form';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz1234567890', 6);
import MyModal from '@fastgpt/web/components/common/MyModal';
import { useTranslation } from 'next-i18next';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { formatEditorVariablePickerIcon } from '@fastgpt/global/core/workflow/utils';
import ChatFunctionTip from './Tip';
import FormLabel from '@fastgpt/web/components/common/MyBox/FormLabel';
import QuestionTip from '@fastgpt/web/components/common/MyTooltip/QuestionTip';
import InputTypeConfig from '@/pages/app/detail/components/WorkflowComponents/Flow/nodes/NodePluginIO/InputTypeConfig';
import AIcon from '@/components/AIcon/AIcon';

export const defaultVariable: VariableItemType = {
  id: nanoid(),
  key: '',
  label: '',
  type: VariableInputEnum.input,
  description: '',
  required: true,
  valueType: WorkflowIOValueTypeEnum.string
};

type InputItemType = VariableItemType & {
  list: { label: string; value: string }[];
};

export const addVariable = () => {
  const newVariable = { ...defaultVariable, key: '', id: '', list: [{ value: '', label: '' }] };
  return newVariable;
};

const VariableEdit = ({
  variables = [],
  onChange
}: {
  variables?: VariableItemType[];
  onChange: (data: VariableItemType[]) => void;
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const form = useForm<VariableItemType>();
  const { setValue, reset, watch, getValues } = form;
  const value = getValues();
  const type = watch('type');

  const inputTypeList = useMemo(
    () =>
      Object.values(variableMap)
        .filter((item) => item.value !== VariableInputEnum.textarea)
        .map((item) => ({
          icon: item.icon,
          label: t(item.label as any),
          value: item.value,
          defaultValueType: item.defaultValueType,
          description: item.description ? t(item.description as any) : ''
        })),
    [t]
  );

  const defaultValueType = useMemo(() => {
    const item = inputTypeList.find((item) => item.value === type);
    return item?.defaultValueType;
  }, [inputTypeList, type]);

  const formatVariables = useMemo(() => {
    const results = formatEditorVariablePickerIcon(variables);
    return results.map<VariableItemType & { icon?: string }>((item) => {
      const variable = variables.find((variable) => variable.key === item.key)!;
      return {
        ...variable,
        icon: item.icon
      };
    });
  }, [variables]);

  const onSubmitSuccess = useCallback(
    (data: InputItemType, action: 'confirm' | 'continue') => {
      data.label = data?.label?.trim();

      const existingVariable = variables.find(
        (item) => item.label === data.label && item.id !== data.id
      );
      if (existingVariable) {
        toast({
          status: 'warning',
          title: t('common:core.module.variable.key already exists')
        });
        return;
      }

      data.key = data.label;
      data.enums = data.list;

      if (data.type === VariableInputEnum.custom) {
        data.required = false;
      } else {
        data.valueType = inputTypeList.find((item) => item.value === data.type)?.defaultValueType;
      }

      const onChangeVariable = [...variables];
      if (data.id) {
        const index = variables.findIndex((item) => item.id === data.id);
        onChangeVariable[index] = data;
      } else {
        onChangeVariable.push({
          ...data,
          id: nanoid()
        });
      }

      if (action === 'confirm') {
        onChange(onChangeVariable);
        reset({});
      } else if (action === 'continue') {
        onChange(onChangeVariable);
        toast({
          status: 'success',
          title: t('common:common.Add Success')
        });
        reset({
          ...addVariable(),
          defaultValue: ''
        });
      }
    },
    [variables, toast, t, inputTypeList, onChange, reset]
  );

  const onSubmitError = useCallback(
    (e: Object) => {
      for (const item of Object.values(e)) {
        if (item.message) {
          toast({
            status: 'warning',
            title: item.message
          });
          break;
        }
      }
    },
    [toast]
  );

  return (
    <Box>
      {/* Row box */}
      <Flex alignItems={'center'}>
        {/* <MyIcon name={'core/app/simpleMode/variable'} w={'20px'} /> */}
        <AIcon name="icon-bianliang-bianliangming" color="primary.500" fontSize="1.5rem"></AIcon>
        <FormLabel ml={2} color={'myGray.600'}>
          {t('common:core.module.Variable')}
        </FormLabel>
        <ChatFunctionTip type={'variable'} />
        <Box flex={1} />
        <Button
          variant={'transparentBase'}
          leftIcon={<SmallAddIcon />}
          iconSpacing={1}
          size={'sm'}
          color={'#333'}
          w={'100px'}
          borderWidth={'1px'}
          onClick={() => {
            reset(addVariable());
          }}
          fontSize={'13px'}
        >
          {t('common:common.Add New')}
        </Button>
      </Flex>
      {/* Form render */}
      {formatVariables.length > 0 && (
        <Box
          mt={2}
          borderRadius={'md'}
          overflow={'hidden'}
          borderWidth={'1px'}
          borderBottom="none"
          mx={'50px'}
        >
          <TableContainer>
            <Table bg={'white'}>
              <Thead h={8}>
                <Tr h={10}>
                  <Th
                    w={'33%'}
                    borderRadius={'none !important'}
                    fontSize={'mini'}
                    bg={'rgb(236,239,246)'}
                    p={0}
                    px={4}
                    fontWeight={'bold'}
                    textAlign={'center'}
                  >
                    {t('workflow:Variable_name')}
                  </Th>
                  <Th
                    fontSize={'mini'}
                    bg={'rgb(236,239,246)'}
                    w={'34%'}
                    p={0}
                    px={4}
                    textAlign={'center'}
                    fontWeight={'bold'}
                  >
                    {t('common:common.Require Input')}
                  </Th>
                  <Th
                    fontSize={'mini'}
                    borderRadius={'none !important'}
                    bg={'rgb(236,239,246)'}
                    w={'33%'}
                    p={0}
                    textAlign={'center'}
                    px={4}
                    fontWeight={'bold'}
                  >
                    {t('common:common.Operation')}
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {formatVariables.map((item) => (
                  <Tr key={item.id}>
                    <Td
                      p={0}
                      px={4}
                      h={8}
                      color={'myGray.900'}
                      fontSize={'mini'}
                      borderRight={'1px solid rgb(226,232,240)'}
                      fontWeight={'medium'}
                    >
                      <Flex alignItems={'center'} justifyContent={'center'}>
                        {/* <MyIcon name={item.icon as any} w={'16px'} color={'myGray.400'} mr={2} /> */}
                        {item.key}
                      </Flex>
                    </Td>
                    <Td
                      p={0}
                      px={4}
                      h={8}
                      color={'myGray.900'}
                      fontSize={'mini'}
                      borderRight={'1px solid rgb(226,232,240)'}
                    >
                      <Flex alignItems={'center'} justifyContent={'center'}>
                        {item.required ? '是' : '否'}
                      </Flex>
                    </Td>
                    <Td p={0} px={4} h={8} color={'myGray.600'} fontSize={'mini'}>
                      <Flex alignItems={'center'} justifyContent={'center'} gap={3}>
                        {/* <MyIcon
                          mr={3}
                          name={'common/settingLight'}
                          w={'18px'}
                          cursor={'pointer'}
                          onClick={() => {
                            const formattedItem = {
                              ...item,
                              list: item.enums || []
                            };
                            reset(formattedItem);
                          }}
                        /> */}
                        <AIcon
                          name="icon-shezhi"
                          fontSize="17px"
                          mr={3}
                          cursor={'pointer'}
                          onClick={() => {
                            const formattedItem = {
                              ...item,
                              list: item.enums || []
                            };
                            reset(formattedItem);
                          }}
                        ></AIcon>
                        <AIcon
                          name="icon-shanchu1"
                          fontSize="17px"
                          mr={3}
                          cursor={'pointer'}
                          onClick={() =>
                            onChange(variables.filter((variable) => variable.id !== item.id))
                          }
                        ></AIcon>
                        {/* <MyIcon
                          name={'delete'}
                          w={'18px'}
                          cursor={'pointer'}
                          onClick={() =>
                            onChange(variables.filter((variable) => variable.id !== item.id))
                          }
                        /> */}
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Edit modal */}
      {!!Object.keys(value).length && (
        <MyModal
          iconSrc="/imgs/images/picture/variable.png"
          title={t('common:core.module.Variable Setting')}
          isOpen={true}
          titleBgc="#E2E3EA"
          onClose={() => reset({})}
          maxW={['90vw', '750px']}
          w={'100%'}
          isCentered
        >
          <Flex h={'560px'}>
            <Stack
              gap={4}
              py={5}
              px={5}
              bg={'linear-gradient(to bottom,#F0F0FA, #fff)'}
              mr={2}
              borderRadius={'0px 10px 10px 10px'}
              borderRight={'1px solid #E2E3EA'}
            >
              {/* <FormLabel color={'myGray.600'} fontWeight={'medium'}>
                {t('workflow:Variable.Variable type')}
              </FormLabel> */}
              {/* <Flex flexDirection={'column'} gap={4}></Flex> */}
              <Box display={'grid'} gridTemplateColumns={'repeat(1, 1fr)'} gap={4}>
                {inputTypeList.map((item) => {
                  const isSelected = type === item.value;
                  return (
                    <Box
                      display={'flex'}
                      key={item.label}
                      border={isSelected ? '1px solid #D7000F' : '1px solid #B7BABF'}
                      px={10}
                      py={4}
                      bg={'#fff'}
                      rounded={'6px'}
                      fontWeight={'medium'}
                      fontSize={'14px'}
                      alignItems={'center'}
                      justifyContent={'center'}
                      cursor={'pointer'}
                      // boxShadow={isSelected ? '0px 0px 0px 2.4px rgba(51, 112, 255, 0.15)' : 'none'}
                      _hover={{
                        '& > svg': {
                          color: 'primary.600'
                        },
                        '& > span': {
                          color: 'myGray.900'
                        },
                        border: '1px solid #D7000F'
                        // boxShadow: '0px 0px 0px 2.4px rgba(51, 112, 255, 0.15)'
                      }}
                      onClick={() => {
                        const defaultValIsNumber = !isNaN(Number(value.defaultValue));
                        // 如果切换到 numberInput，不是数字，则清空
                        if (
                          item.value === VariableInputEnum.select ||
                          (item.value === VariableInputEnum.numberInput && !defaultValIsNumber)
                        ) {
                          setValue('defaultValue', '');
                        }
                        setValue('type', item.value);
                      }}
                    >
                      {/* <MyIcon
                        name={item.icon as any}
                        w={'20px'}
                        mr={1.5}
                        color={isSelected ? 'primary.600' : 'myGray.400'}
                      /> */}
                      <Box
                        as="span"
                        color={isSelected ? 'myGray.900' : 'inherit'}
                        whiteSpace="nowrap"
                      >
                        {item.label}
                      </Box>
                      {/* {item.description && (
                        <QuestionTip label={item.description as string} ml={1} />
                      )} */}
                    </Box>
                  );
                })}
              </Box>
            </Stack>
            <InputTypeConfig
              form={form}
              type={'variable'}
              isEdit={!!value.key}
              inputType={type}
              defaultValueType={defaultValueType}
              onClose={() => reset({})}
              onSubmitSuccess={onSubmitSuccess}
              onSubmitError={onSubmitError}
            />
          </Flex>
        </MyModal>
      )}
    </Box>
  );
};

export default React.memo(VariableEdit);
