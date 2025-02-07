import React, { useCallback, useEffect, useState } from 'react';
import { Flex, Box, Text, useDisclosure, Spinner } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import style from '../index.module.scss';
import MyIcon from '@fastgpt/web/components/common/Icon';
import MyInput from '@/components/MyInput';
import { searchGraph, type graphListResItem } from '@/web/core/graph/api';
import MyLoading from '@fastgpt/web/components/common/MyLoading';
import { useToast } from '@fastgpt/web/hooks/useToast';

export interface GraphHistoryItemType {
  id: string;
  name: string;
  filename: string;
  //...
}

interface GraphHistorySidebarProps {
  graphHistory: GraphHistoryItemType[];
  activeGraphId: string;
  searchText?: string;
  onInpuChange?: () => void;
}

const GraphHistorySidebar: React.FC<GraphHistorySidebarProps> = ({
  graphHistory,
  activeGraphId
}) => {
  const router = useRouter();
  const onChangeGraph = useCallback(
    (graphId: string) => {
      router.replace({
        query: {
          ...router.query,
          graphId
        }
      });
    },
    [router]
  );

  const { toast } = useToast();
  //搜索
  const [searchText, setSearchText] = useState('');
  const [graphList, setGraphList] = useState<graphListResItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const onInpuChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(e.target.value); // 更新状态
      console.log('inputValue', searchText);
    },
    [searchText]
  );
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(); // 如果按下回车键，调用 onSearch
    }
  };
  //searchText变化即触发onSearch
  useEffect(() => {
    onSearch();
  }, [searchText]);

  const onSearch = async () => {
    setIsLoading(true);
    try {
      const res = await searchGraph({ searchname: searchText });
      setGraphList(res);

      // if (res.length === 0) {
      //   toast({
      //     title: '未搜索到相关图谱',
      //     status: 'warning'
      //   });
      // }
    } catch (error: any) {
      console.error(error);
      toast({
        title: error.message || '搜索失败,请稍后重试',
        status: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const graphListFromSearch: GraphHistoryItemType[] = graphList.map((item) => ({
    id: item.fileId,
    name: item.datasetName,
    filename: item.filename
  }));

  // 省略号函数
  function ellipsis(str: string, maxLength: number) {
    return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
  }

  function renderList(items: GraphHistoryItemType[]) {
    return (
      <div>
        {items.map((item) => (
          <Box
            key={item.id}
            cursor={'pointer'}
            height={'60px'}
            marginTop={2}
            px={2}
            mr={2}
            pt={1}
            position={'relative'}
            borderRadius={'10px'}
            border={'1px solid rgba(215, 215, 215, 1)'}
            {...(item.id === activeGraphId
              ? {
                  bg: '#eceff6',
                  boxShadow: 'md'
                }
              : {
                  _hover: {
                    bg: 'myGray.200'
                  },
                  onClick: () => onChangeGraph(item.id)
                })}
          >
            <Box
              borderWidth={'14px'}
              borderTopLeftRadius={'9px'}
              borderColor={'rgb(129, 216, 207) transparent transparent rgb(129, 216, 207)'}
              position={'absolute'}
              top={0}
              left={0}
            />

            <Text
              mx={'auto'}
              fontSize="sm"
              w={'75%'}
              textAlign={'center'}
              style={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
              }}
            >
              {item.name}
            </Text>
            <Text fontSize="xs" isTruncated textAlign={'center'} mt={2}>
              {item.filename}
            </Text>
          </Box>
        ))}
      </div>
    );
  }
  return (
    <Flex flexDirection={'column'} h={'100%'} w={'100%'} bg={'white'} borderRadius={'10px'}>
      {/* 搜索 */}

      <Box pr={2}>
        <MyInput
          leftIcon={
            <MyIcon
              name="common/searchLight"
              position={'absolute'}
              w={'1.5rem'}
              color={'primary.500'}
            />
          }
          pl={'38px'}
          value={searchText}
          borderColor={'myGray.300'}
          onChange={onInpuChange}
          onKeyDown={handleKeyDown}
        />
      </Box>
      {isLoading ? (
        <Flex h={'100%'} className="nn" justify={'center'} align={'center'}>
          <Spinner
            style={{ display: 'block' }}
            thickness="2px"
            speed="0.65s"
            emptyColor="myGray.100"
            color="primary.500"
          />
        </Flex>
      ) : (
        <Box flex={'1 0 0'} h={0} overflow={'overlay'} className={style.scroll}>
          {Array.isArray(graphListFromSearch)
            ? // && graphListFromSearch.length > 0
              renderList(graphListFromSearch)
            : renderList(graphHistory)}
        </Box>
      )}
    </Flex>
  );
};

export default React.memo(GraphHistorySidebar);
