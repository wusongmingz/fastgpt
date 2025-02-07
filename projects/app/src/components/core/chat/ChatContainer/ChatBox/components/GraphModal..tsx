// @ts-nocheck
import { ECOption } from '@/pages/knowledgeGraph/components/BaseGraph';
import { Box, Flex, ModalBody, Stack, Text } from '@chakra-ui/react';
import { SearchDataResponseItemType } from '@fastgpt/global/core/dataset/type';
import MyModal from '@fastgpt/web/components/common/MyModal';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
const EChartsWrapper = dynamic(() => import('@/pages/knowledgeGraph/components/BaseGraph'), {
  ssr: false
});
const GraphModal = ({
  quoteList,
  onClose
}: {
  quoteList: SearchDataResponseItemType[] | undefined;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const graphMenuList = useMemo(() => {
    return (
      quoteList.map((item) => {
        return {
          id: item.id,
          title: item.sourceName
        };
      }) || []
    );
  }, [quoteList]);
  const [currentGraphId, setCurrentGraphId] = useState(graphMenuList[0]?.id || '');
  const activeGraph = useMemo(() => {
    return quoteList.find((item) => {
      return item.id === currentGraphId;
    });
  }, [quoteList, currentGraphId]);
  return (
    <MyModal title={t('common:core.chat.response.graph map')} titleBgc="#e2e3ea" onClose={onClose}>
      <ModalBody w={'800px'} p={0}>
        <Flex h={'600px'}>
          <Stack w={'160px'} p={2} px={4} gap={'10px'} borderRight={'1px solid #d7d7d7'}>
            {graphMenuList.length > 0 &&
              graphMenuList.map((item) => {
                return (
                  <Flex
                    key={item.id}
                    fontSize={'0.85rem'}
                    w={'100%'}
                    py={4}
                    cursor={'pointer'}
                    userSelect={'none'}
                    _hover={{
                      transform: 'scale(1.05)',
                      transition: 'all 0.2s',
                      boxShadow: 2

                      //   bg: '#edf1f4',
                      //   boxShadow: '2px 2px 3px rgb(0,0,0,0.2)'
                    }}
                    justifyContent={'center'}
                    onClick={() => {
                      setCurrentGraphId(item.id);
                    }}
                    borderRadius={'5px'}
                    border={'1px solid #d7d7d7'}
                    {...(currentGraphId == item.id
                      ? {
                          transform: 'scale(1.05)',
                          boxShadow: 2
                        }
                      : '')}
                  >
                    <Text>{item.title}</Text>
                  </Flex>
                );
              })}
          </Stack>
          <Box overflow={'auto'}>
            <GraphEcharts
              data={activeGraph?.graph_response?.data.context_data?.data || []}
              links={activeGraph?.graph_response?.data.context_data?.links || []}
            ></GraphEcharts>
          </Box>
        </Flex>
      </ModalBody>
    </MyModal>
  );
};

const GraphEcharts = (graphData: { data: any[]; links: any[] }) => {
  let option: ECOption = {
    title: {
      text: ''
    },
    tooltip: {},
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    label: {
      normal: {
        show: true,
        textStyle: {
          fontSize: 12
        }
      }
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        symbolSize: 45,
        focusNodeAdjacency: true,
        roam: true,
        edgeSymbol: ['none', 'arrow'], // 第一个值代表起始箭头，第二个值代表结束箭头；'arrow' 表示箭头
        label: {
          show: true,
          fontSize: 12,
          position: 'bottom',
          formatter: function (params: { data: any }) {
            return ellipsis(params.data.name, 10);
          }
        },
        force: {
          repulsion: 1000
        },
        edgeSymbolSize: [4, 10],
        edgeLabel: {
          show: false,
          fontSize: 10,
          formatter: '{c}'
        },
        itemStyle: {
          //配置节点的颜色已及尺寸
          color: function (params: { dataIndex: number }) {
            var colorList = [
              '#5470c6',
              '#91cc75',
              '#fac858',
              '#ee6666',
              '#73c0de',
              '#3ba272',
              '#fc8452',
              '#9a60b4',
              '#ea7ccc'
            ];
            return colorList[params.dataIndex % colorList.length];
          }
        },
        lineStyle: {
          color: 'source',
          curveness: 0.3
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 10
          }
        },
        tooltip: {
          show: true,
          formatter: function (params: { data: any }) {
            if (!params.data.name) {
              return params.data.value;
            }
            return params.data.name;
          },
          extraCssText: 'max-width: 400px;white-space:pre-wrap',
          confine: true // 是否将 tooltip 框限制在图表的区域内。
        },
        data: graphData.data || [],
        links: graphData.links || []
      }
    ]
  };
  function ellipsis(str: string, maxLength: number) {
    return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
  }
  return <EChartsWrapper renderer="svg" width={640} height={600} options={option}></EChartsWrapper>;
};
export default GraphModal;
