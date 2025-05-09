import React, { useMemo } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import {
  Box,
  Button,
  Card,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Textarea
} from '@chakra-ui/react';
import ChatAvatar from './ChatAvatar';
import { MessageCardStyle } from '../constants';
import { VariableInputEnum } from '@fastgpt/global/core/workflow/constants';
import MySelect from '@fastgpt/web/components/common/MySelect';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { ChatBoxInputFormType } from '../type.d';
import { useContextSelector } from 'use-context-selector';
import { ChatBoxContext } from '../Provider';
import QuestionTip from '@fastgpt/web/components/common/MyTooltip/QuestionTip';
import { useDeepCompareEffect } from 'ahooks';
import { VariableItemType } from '@fastgpt/global/core/app/type';
import MyTextarea from '@/components/common/Textarea/MyTextarea';
import MyNumberInput from '@fastgpt/web/components/common/Input/NumberInput';

export const VariableInputItem = ({
  item,
  variablesForm
}: {
  item: VariableItemType;
  variablesForm: UseFormReturn<any>;
}) => {
  const { register, control, formState, setValue } = variablesForm;
  return (
    <Box key={item.id} mb={4} pl={1}>
      <Box
        as={'label'}
        display={'flex'}
        position={'relative'}
        mb={1}
        alignItems={'center'}
        w={'full'}
      >
        {item.label}

        {item.required && (
          <Box
            position={'absolute'}
            top={'-2px'}
            left={'-8px'}
            color={'red.500'}
            fontWeight={'bold'}
          >
            *
          </Box>
        )}
        {item.description && <QuestionTip ml={1} label={item.description} />}
      </Box>
      {item.type === VariableInputEnum.input && (
        <MyTextarea
          autoHeight
          minH={'30px'}
          maxH={160}
          // bg={'myGray.50'}
          _hover={{
            borderColor: 'primary.500'
          }}
          {...register(`variables.${item.key}`, {
            required: item.required
          })}
        />
      )}
      {item.type === VariableInputEnum.textarea && (
        <Textarea
          _hover={{
            borderColor: 'primary.500'
          }}
          {...register(`variables.${item.key}`, {
            required: item.required
          })}
          rows={5}
          // bg={'myGray.50'}
          maxLength={item.maxLength || 4000}
        />
      )}

      {item.type === VariableInputEnum.select && (
        <Controller
          key={`variables.${item.key}`}
          control={control}
          name={`variables.${item.key}`}
          rules={{ required: item.required }}
          render={({ field: { ref, value } }) => {
            return (
              <MySelect
                ref={ref}
                width={'100%'}
                list={(item.enums || []).map((item: { value: any }) => ({
                  label: item.value,
                  value: item.value
                }))}
                value={value}
                onchange={(e) => setValue(`variables.${item.key}`, e)}
              />
            );
          }}
        />
      )}
      {item.type === VariableInputEnum.numberInput && (
        <Controller
          key={`variables.${item.key}`}
          control={control}
          name={`variables.${item.key}`}
          rules={{ required: item.required, min: item.min, max: item.max }}
          render={({ field: { value, onChange } }) => (
            <MyNumberInput
              step={1}
              min={item.min}
              max={item.max}
              bg={'white'}
              _hover={{
                borderColor: 'primary.500'
              }}
              value={value}
              onChange={onChange}
            />
          )}
        />
      )}
    </Box>
  );
};

const VariableInput = ({
  chatForm,
  chatStarted
}: {
  chatStarted: boolean;
  chatForm: UseFormReturn<ChatBoxInputFormType>;
}) => {
  const { t } = useTranslation();

  const { appAvatar, variableList, variablesForm } = useContextSelector(ChatBoxContext, (v) => v);
  const { reset, handleSubmit: handleSubmitChat } = variablesForm;

  const defaultValues = useMemo(() => {
    return variableList.reduce((acc: Record<string, any>, item) => {
      acc[item.key] = item.defaultValue;
      return acc;
    }, {});
  }, [variableList]);

  useDeepCompareEffect(() => {
    reset(defaultValues);
  }, [defaultValues]);

  return (
    <Box py={3}>
      <ChatAvatar src={'/imgs/images/picture/bigmodel.png'} type={'AI'} />
      <Box textAlign={'left'} ml={8}>
        <Card
          order={2}
          mt={2}
          w={'100%'}
          border={'1px solid #91C6DE'}
          {...MessageCardStyle}
          bg={'white'}
          px={8}
          // boxShadow={'0 0 8px rgba(0,0,0,0.15)'}
        >
          {variableList.map((item) => (
            <VariableInputItem key={item.id} item={item} variablesForm={variablesForm} />
          ))}
          {!chatStarted && (
            <Box>
              <Button
                // leftIcon={<MyIcon name={'core/chat/chatFill'} w={'16px'} />}
                size={'sm'}
                // float={'right'}
                variant={'blackCommon'}
                maxW={'120px'}
                onClick={handleSubmitChat(() => {
                  chatForm.setValue('chatStarted', true);
                })}
              >
                {t('common:core.chat.Start Chat')}
              </Button>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
};

export default VariableInput;
