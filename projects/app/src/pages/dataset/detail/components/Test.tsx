import React, { useEffect, useMemo, useState } from 'react';
import { Box, Textarea, Button, Flex, useTheme, useDisclosure } from '@chakra-ui/react';
import { useDatasetStore } from '@/web/core/dataset/store/dataset';
import { useSearchTestStore, SearchTestStoreItemType } from '@/web/core/dataset/store/searchTest';
import { postSearchText } from '@/web/core/dataset/api';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useRequest, useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { formatTimeToChatTime } from '@fastgpt/global/common/string/time';
import { getErrText } from '@fastgpt/global/common/error/utils';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { customAlphabet } from 'nanoid';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';
import { useTranslation } from 'next-i18next';
import { SearchTestResponse } from '@/global/core/dataset/api';
import {
  DatasetSearchModeEnum,
  DatasetSearchModeMap
} from '@fastgpt/global/core/dataset/constants';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import MySelect from '@fastgpt/web/components/common/MySelect';
import { useSelectFile } from '@/web/common/file/hooks/useSelectFile';
import { fileDownload } from '@/web/common/file/utils';
import QuoteItem from '@/components/core/dataset/QuoteItem';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import SearchParamsTip from '@/components/core/dataset/SearchParamsTip';
import { useContextSelector } from 'use-context-selector';
import { DatasetPageContext } from '@/web/core/dataset/context/datasetPageContext';
import EmptyTip from '@fastgpt/web/components/common/EmptyTip';
import QuestionTip from '@fastgpt/web/components/common/MyTooltip/QuestionTip';
import AIcon from '@/components/AIcon/AIcon';
import GraphSearchParamsTip from '@/components/core/dataset/GraphSearchParamsTip';
import { ColumnDef } from '@tanstack/react-table';
import {
  GraphSearchRelationshipsData,
  GraphSearchReportsData
} from '@/pages/api/core/dataset/searchTest';
import ATable from '@/components/common/ATable';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz1234567890', 12);

const DatasetParamsModal = dynamic(() => import('@/components/core/app/DatasetParamsModal'));

type FormType = {
  inputText: string;
  searchParams: {
    searchMode: `${DatasetSearchModeEnum}`;
    similarity?: number;
    limit?: number;
    usingReRank?: boolean;
    datasetSearchUsingExtensionQuery?: boolean;
    datasetSearchExtensionModel?: string;
    datasetSearchExtensionBg?: string;
  };
};

const Test = ({ datasetId }: { datasetId: string }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { llmModelList } = useSystemStore();
  const datasetDetail = useContextSelector(DatasetPageContext, (v) => v.datasetDetail);
  const { pushDatasetTestItem } = useSearchTestStore();
  const [inputType, setInputType] = useState<'text' | 'file'>('text');
  const [datasetTestItem, setDatasetTestItem] = useState<SearchTestStoreItemType>();
  const [refresh, setRefresh] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const { File, onOpen } = useSelectFile({
    fileType: '.csv',
    multiple: false
  });
  const [selectFile, setSelectFile] = useState<File>();
  const [searchMode, setSearchMode] = useState('embedding');

  const datasetSearchDefaultValues = {
    inputText: '',
    searchParams: {
      searchMode: DatasetSearchModeEnum.embedding,
      usingReRank: false,
      limit: 5000,
      similarity: 0,
      datasetSearchUsingExtensionQuery: true,
      datasetSearchExtensionModel: llmModelList[0].model,
      datasetSearchExtensionBg: ''
    }
  };

  const graphSearchDefaultValuess = {
    inputText: '',
    searchParams: {
      searchMode: DatasetSearchModeEnum.graphFullTextRecall,
      usingReRank: false,
      limit: 5000,
      similarity: 0,
      datasetSearchUsingExtensionQuery: true,
      datasetSearchExtensionModel: llmModelList[0].model,
      datasetSearchExtensionBg: ''
    }
  };

  const { getValues, setValue, register, handleSubmit } = useForm<FormType>({
    defaultValues:
      datasetDetail.type === 'graph' ? graphSearchDefaultValuess : datasetSearchDefaultValues
    // {
    //   inputText: '',
    //   searchParams: {
    //     searchMode:
    //       datasetDetail.type === 'graph'
    //         ? DatasetSearchModeEnum.graphFullTextRecall
    //         : DatasetSearchModeEnum.embedding,
    //     usingReRank: false,
    //     limit: 5000,
    //     similarity: 0,
    //     datasetSearchUsingExtensionQuery: true,
    //     datasetSearchExtensionModel: llmModelList[0].model,
    //     datasetSearchExtensionBg: ''
    //   }
    // }
  });

  useEffect(() => {
    if (datasetDetail.type === 'graph') {
      console.log('111');
      setValue('searchParams.searchMode', DatasetSearchModeEnum.graphFullTextRecall);
      setSearchMode(getValues(`searchParams.searchMode`));
    }
  }, [datasetDetail.type]);

  // const searchModeData = DatasetSearchModeMap[getValues(`searchParams.searchMode`)]
  const searchModeData = useMemo(
    () => DatasetSearchModeMap[getValues(`searchParams.searchMode`)],
    [searchMode]
  );

  const {
    isOpen: isOpenSelectMode,
    onOpen: onOpenSelectMode,
    onClose: onCloseSelectMode
  } = useDisclosure();

  const { runAsync: onTextTest, loading: textTestIsLoading } = useRequest2(
    ({ inputText, searchParams }: FormType) =>
      postSearchText({ datasetId, text: inputText.trim(), ...searchParams }),
    {
      onSuccess(res: SearchTestResponse) {
        if (!res || res.list.length === 0) {
          return toast({
            status: 'warning',
            title: t('common:dataset.test.noResult')
          });
        }

        const testItem: SearchTestStoreItemType = {
          id: nanoid(),
          datasetId,
          type: datasetDetail.type,
          text: getValues('inputText').trim(),
          time: new Date(),
          results: res.list,
          duration: res.duration,
          searchMode: res.searchMode,
          usingReRank: res.usingReRank,
          limit: res.limit,
          similarity: res.similarity,
          queryExtensionModel: res.queryExtensionModel
        };
        pushDatasetTestItem(testItem);
        setDatasetTestItem(testItem);
      },
      onError(err) {
        toast({
          title: getErrText(err),
          status: 'error'
        });
      }
    }
  );

  const onSelectFile = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setSelectFile(file);
  };

  useEffect(() => {
    setDatasetTestItem(undefined);
  }, [datasetId]);

  return (
    <Box h={'100%'} display={['block', 'flex']}>
      {/* left  */}
      <Box
        h={['auto', '100%']}
        display={['block', 'flex']}
        flexDirection={'column'}
        flex={1}
        // maxW={'500px'}
        py={4}
      >
        {/* 测试文本框 */}
        <Box
          display={'flex'}
          flexDirection={'column'}
          h={'650px'}
          border={'2px solid'}
          p={3}
          ml={2}
          borderRadius={'md'}
          {...(isFocus
            ? {
                borderColor: 'primary.500'
                // boxShadow: '0px 0px 0px 2.4px rgba(51, 112, 255, 0.15)'
              }
            : {
                borderColor: 'primary.300'
              })}
        >
          {/* header */}
          <Flex alignItems={'center'} justifyContent={'space-between'}>
            <MySelect<'text' | 'file'>
              size={'sm'}
              w={'150px'}
              list={[
                {
                  label: (
                    <Flex alignItems={'center'}>
                      {/* <MyIcon mr={2} name={'text'} w={'14px'} color={'primary.600'} /> */}
                      <Box fontSize={'sm'} fontWeight={'normal'} flex={1}>
                        {t('common:core.dataset.test.Test Text')}
                      </Box>
                    </Flex>
                  ),
                  value: 'text'
                }
                // {
                //   label: (
                //     <Flex alignItems={'center'}>
                //       <MyIcon mr={2} name={'file/csv'} w={'14px'} color={'primary.600'} />
                //       <Box fontSize={'sm'} fontWeight={'bold'} flex={1}>
                //         {t('common:core.dataset.test.Batch test')}
                //       </Box>
                //     </Flex>
                //   ),
                //   value: 'file'
                // }
              ]}
              value={inputType}
              onchange={(e) => setInputType(e)}
            />

            <Button
              variant={'whiteCommon'}
              w={'100px'}
              h={'32px'}
              // leftIcon={<MyIcon name={searchModeData.icon as any} w={'14px'} />}
              size={'md'}
              onClick={onOpenSelectMode}
              fontWeight={'bold'}
            >
              {t(searchModeData.title as any)}
            </Button>
          </Flex>

          <Box flex={1} mt={2}>
            {inputType === 'text' && (
              <Textarea
                h={'100%'}
                resize={'none'}
                variant={'outline'}
                maxLength={datasetDetail.vectorModel?.maxToken}
                placeholder={t('common:core.dataset.test.Test Text Placeholder')}
                onFocus={() => setIsFocus(true)}
                {...register('inputText', {
                  required: true,
                  onBlur: () => {
                    setIsFocus(false);
                  }
                })}
              />
            )}
            {inputType === 'file' && (
              <Box pt={5}>
                <Flex
                  p={3}
                  borderRadius={'md'}
                  borderWidth={'1px'}
                  borderColor={'borderColor.base'}
                  borderStyle={'dashed'}
                  bg={'white'}
                  cursor={'pointer'}
                  justifyContent={'center'}
                  _hover={{
                    bg: 'primary.100',
                    borderColor: 'primary.500',
                    borderStyle: 'solid'
                  }}
                  onClick={onOpen}
                >
                  <MyIcon mr={2} name={'file/csv'} w={'24px'} />
                  <Box>
                    {selectFile
                      ? selectFile.name
                      : t('common:core.dataset.test.Batch test Placeholder')}
                  </Box>
                </Flex>
                <Box mt={3} fontSize={'sm'}>
                  {t('common:info.csv_message')}
                  <Box
                    as={'span'}
                    color={'primary.600'}
                    cursor={'pointer'}
                    onClick={() => {
                      fileDownload({
                        text: `"问题"\n"问题1"\n"问题2"\n"问题3"`,
                        type: 'text/csv',
                        filename: 'Test Template'
                      });
                    }}
                  >
                    {t('common:info.csv_download')}
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          <Button
            w={'100px'}
            h={'32px'}
            mt={2}
            ml={'auto'}
            size={'md'}
            variant={'blackCommon'}
            isLoading={textTestIsLoading}
            isDisabled={inputType === 'file' && !selectFile}
            onClick={() => {
              if (inputType === 'text') {
                handleSubmit((data) => onTextTest(data))();
              } else {
                // handleSubmit((data) => onFileTest(data))();
              }
            }}
          >
            {t('common:core.dataset.test.Test')}
          </Button>
        </Box>
        {/* 搜索历史 */}
        <Box
          mt={2}
          ml={2}
          overflow={'overlay'}
          display={['none', 'block']}
          border={'1px solid #ECEFF6'}
          borderRadius={'lg'}
          boxShadow={'-3px 5px 2px rgba(0, 0, 0, 0.05)'}
          h={'100%'}
        >
          <TestHistories
            datasetId={datasetId}
            datasetTestItem={datasetTestItem}
            setDatasetTestItem={setDatasetTestItem}
          />
        </Box>
      </Box>
      {/* result show */}
      <Box h={['auto', '100%']} px={2} py={4} overflow={'overlay'} flex={1} bg={'white'}>
        <Box
          px={2}
          w={['auto', '100%']}
          h={['auto', '100%']}
          border={'2px solid'}
          borderColor={'#91c6de'}
          borderRadius={'lg'}
          boxShadow={'-3px 5px 2px rgba(0, 0, 0, 0.05)'}
          overflowY={'auto'}
        >
          <TestResults datasetTestItem={datasetTestItem} />
        </Box>
      </Box>

      {isOpenSelectMode && (
        <DatasetParamsModal
          {...getValues('searchParams')}
          maxTokens={20000}
          onClose={onCloseSelectMode}
          onSuccess={(e) => {
            setValue('searchParams', {
              ...getValues('searchParams'),
              ...e
            });
            setSearchMode(e.searchMode);
            setRefresh((state) => !state);
          }}
        />
      )}
      <File onSelect={onSelectFile} />
    </Box>
  );
};

export default React.memo(Test);

const TestHistories = React.memo(function TestHistories({
  datasetId,
  datasetTestItem,
  setDatasetTestItem
}: {
  datasetId: string;
  datasetTestItem?: SearchTestStoreItemType;
  setDatasetTestItem: React.Dispatch<React.SetStateAction<SearchTestStoreItemType | undefined>>;
}) {
  const { t } = useTranslation();
  const { datasetTestList, delDatasetTestItemById } = useSearchTestStore();

  const testHistories = useMemo(
    () => datasetTestList.filter((item) => item.datasetId === datasetId),
    [datasetId, datasetTestList]
  );

  return (
    <>
      <Flex
        alignItems={'center'}
        color={'myGray.900'}
        h={'40px'}
        borderRadius={'lg'}
        border={'1px solid #ECEFF6'}
        px={4}
        gap={4}
      >
        {/* <MyIcon mr={2} name={'history'} w={'18px'} h={'18px'} color={'myGray.900'} /> */}
        <AIcon name="icon-fenlei-lishi" color={'primary.500'} fontSize="1.875rem" />
        <Box fontSize={'sm'}>{t('common:core.dataset.test.test history')}</Box>
      </Flex>
      <Box mt={2}>
        {testHistories.map((item) => (
          <Flex
            key={item.id}
            px={3}
            py={2}
            mx={3}
            justifyContent={'space-between'}
            alignItems={'center'}
            borderColor={'borderColor.low'}
            bgColor={'borderColor.low'}
            borderWidth={'1px'}
            borderRadius={'md'}
            _notLast={{
              mb: 2
            }}
            _hover={{
              borderColor: 'primary.300',
              boxShadow: '1'
              // '& .delete': {
              //   display: 'block'
              // }
            }}
            cursor={'pointer'}
            fontSize={'sm'}
            {...(item.id === datasetTestItem?.id && {
              borderColor: 'primary.300'
              // bg: 'primary.50'
              // TODO: 当前选中历史背景色
            })}
            onClick={() => setDatasetTestItem(item)}
          >
            <Box flex={'0 0 auto'} mr={2}>
              {DatasetSearchModeMap[item.searchMode] ? (
                <Flex alignItems={'center'} fontWeight={'500'} color={'myGray.500'}>
                  {/* <MyIcon
                    name={DatasetSearchModeMap[item.searchMode].icon as any}
                    w={'12px'}
                    mr={'1px'}
                  /> */}
                  {t(DatasetSearchModeMap[item.searchMode].title as any)}
                </Flex>
              ) : (
                '-'
              )}
            </Box>
            <Box
              mr={2}
              wordBreak={'break-all'}
              fontWeight={'400'}
              // minWidth={'200px'}
              w={'200px'}
              h={'30px'}
              overflow={'hidden'}
              textOverflow={'ellipsis'}
              whiteSpace={'nowrap'}
            >
              {item.text}
            </Box>
            <Box flex={'0 0 70px'}>
              {t(formatTimeToChatTime(item.time) as any).replace('#', ':')}
            </Box>
            <MyTooltip label={t('common:core.dataset.test.delete test history')}>
              <Box w={'24px'} h={'24px'} display="block">
                <AIcon
                  name="icon-shanchu1"
                  color="#000"
                  fontSize="1.25rem"
                  _hover={{ color: 'primary.500' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    delDatasetTestItemById(item.id);
                    datasetTestItem?.id === item.id && setDatasetTestItem(undefined);
                  }}
                />
                {/* <MyIcon
                  className="delete"
                  name={'delete'}
                  w={'14px'}
                  display={'none'}
                  _hover={{ color: 'red.600' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    delDatasetTestItemById(item.id);
                    datasetTestItem?.id === item.id && setDatasetTestItem(undefined);
                  }}
                /> */}
              </Box>
            </MyTooltip>
          </Flex>
        ))}
      </Box>
    </>
  );
});

const TestResults = React.memo(function TestResults({
  datasetTestItem
}: {
  datasetTestItem?: SearchTestStoreItemType;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const graphSearchColumns: ColumnDef<GraphSearchReportsData | GraphSearchRelationshipsData>[] =
    useMemo(() => {
      const modeToKeyMap: Record<string, string[]> = {
        [DatasetSearchModeEnum.graphFullTextRecall]: ['id', 'title', 'content'],
        [DatasetSearchModeEnum.graphLocalTextRecall]: ['id', 'source', 'target', 'description']
      };
      if (!datasetTestItem) return [];
      return modeToKeyMap[datasetTestItem['searchMode']]?.map((key) => ({
        accessorKey: key,
        header: key,
        cell: (info) => info.getValue()
      }));
    }, [datasetTestItem]);
  console.log(datasetTestItem);
  return (
    <>
      {!datasetTestItem?.results || datasetTestItem.results.length === 0 ? (
        <EmptyTip text={t('common:core.dataset.test.test result placeholder')} mt={[10, '20vh']} />
      ) : (
        <>
          {/* <Flex fontSize={'md'} color={'myGray.900'} alignItems={'center'}>
            <MyIcon name={'common/paramsLight'} w={'18px'} mr={2} />
            {t('common:core.dataset.test.Test params')}
          </Flex> */}
          <Box mt={3} border={'1px solid'} borderColor={'borderColor.low'} borderRadius={'md'}>
            <Box
              py={2}
              px={4}
              maxH={'40px'}
              fontSize={'sm'}
              fontWeight={'bold'}
              color={'myGray.900'}
              border={'1px solid'}
              borderColor={'borderColor.low'}
              borderRadius={'md'}
            >
              {/* <MyIcon name={'common/paramsLight'} w={'18px'} mr={2} /> */}
              {t('common:core.dataset.test.Test params')}
            </Box>
            {datasetTestItem.type !== 'graph' ? (
              <SearchParamsTip
                searchMode={datasetTestItem.searchMode}
                similarity={datasetTestItem.similarity}
                limit={datasetTestItem.limit}
                usingReRank={datasetTestItem.usingReRank}
                datasetSearchUsingExtensionQuery={!!datasetTestItem.queryExtensionModel}
                queryExtensionModel={datasetTestItem.queryExtensionModel}
              />
            ) : (
              <GraphSearchParamsTip searchMode={datasetTestItem.searchMode} />
            )}
          </Box>

          {datasetTestItem.type !== 'graph' && (
            <>
              <Flex mt={5} mb={3} alignItems={'center'}>
                <Flex
                  pl={2}
                  fontSize={'sm'}
                  color={'myGray.900'}
                  fontWeight={'bold'}
                  alignItems={'center'}
                >
                  {/* <MyIcon name={'common/resultLight'} w={'18px'} mr={2} /> */}
                  {t('common:core.dataset.test.Test Result')}
                </Flex>
                <QuestionTip ml={1} label={t('common:core.dataset.test.test result tip')} />
                <Box ml={2}>({datasetTestItem.duration})</Box>
              </Flex>
              <Box mt={1} gap={4} overflow={'overlay'}>
                {datasetTestItem?.results.map((item, index) => (
                  <Box key={item.id} p={3} borderRadius={'lg'} bg={'#eceff6'} _notLast={{ mb: 2 }}>
                    <QuoteItem quoteItem={item} canViewSource />
                  </Box>
                ))}
              </Box>
            </>
          )}

          {datasetTestItem.type === 'graph' && (
            <Box mt={5} maxW={'35vw'}>
              <ATable<GraphSearchRelationshipsData | GraphSearchReportsData>
                data={datasetTestItem.results}
                columns={graphSearchColumns}
                align="left"
              />
            </Box>
          )}
        </>
      )}
    </>
  );
});
