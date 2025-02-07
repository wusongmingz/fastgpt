// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Flex, Text, Button } from '@chakra-ui/react';
import MyBox from '@fastgpt/web/components/common/MyBox';
import MyIcon from '@fastgpt/web/components/common/Icon';
import MyInput from '@/components/MyInput';
import GraphHistorySidebar, { type GraphHistoryItemType } from './components/GraphHistorySidebar';
import type { ECOption } from './components/EChartsConfig';
import { getGraphList, getGraphData, type graphListResItem } from '@/web/core/graph/api';
import { useRequest } from '@fastgpt/web/hooks/useRequest';
import dynamic from 'next/dynamic';
const EChartsWrapper = dynamic(() => import('./components/BaseGraph'), { ssr: false });
import MyLoading from '@fastgpt/web/components/common/MyLoading';
import { serviceSideProps } from '@/web/common/utils/i18n';

type Props = { graphId: string };
type GraphData = {
  data?: any[];
  links?: any[];
};

const KnowledgeGraph = () => {
  const [graphList, setGraphList] = useState<graphListResItem[]>([]);
  const [graphTitle, setGraphTitle] = useState<string>('');
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const graphId = router.query.graphId as string;

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await getGraphList();
        if (!isMounted) return;
        setGraphList(res);

        const fetchGraphData = async (graphId: string) => {
          const graphDataRes = await getGraphData({ fileId: graphId });
          if (!isMounted) return;
          setGraphData(graphDataRes);
        };

        const currentGraph = res.find((item) => item.fileId === graphId);
        if (currentGraph && graphId) {
          setGraphTitle(currentGraph.datasetName);
          setActiveGraphId(graphId);
          await fetchGraphData(graphId);
        } else if (res.length > 0) {
          const firstGraph = res[0];
          setGraphTitle(firstGraph.datasetName);
          setActiveGraphId(firstGraph.fileId);
          await fetchGraphData(firstGraph.fileId);
        }
      } catch (error) {
        console.error('Error fetching graph data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // 清除挂载状态
    return () => {
      isMounted = false;
    };
  }, [graphId]);

  /* sidebar data */
  const [activeGraphId, setActiveGraphId] = useState<string>('');
  const graphHistoryData: GraphHistoryItemType[] = graphList.map((item) => ({
    id: item.fileId,
    name: item.datasetName,
    filename: item.filename
  }));

  // 省略号函数
  function ellipsis(str: string, maxLength: number) {
    return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
  }
  //echarts options
  let option = {
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
          normal: {
            show: true,
            textStyle: {
              fontSize: 12
            },
            position: 'bottom',
            formatter: function (params: { data: any }) {
              return ellipsis(params.data.name, 10);
            }
          }
        },
        force: {
          repulsion: 1000
        },
        edgeSymbolSize: [4, 10],
        edgeLabel: {
          normal: {
            show: false,
            textStyle: {
              fontSize: 10
            },
            formatter: '{c}'
          }
        },
        itemStyle: {
          //配置节点的颜色已及尺寸
          normal: {
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
        data: graphData?.data ?? [],
        links: graphData?.links ?? []
      }
    ]
  };

  return (
    <MyBox
      flexDirection={'column'}
      height={'calc(100vh - 100px)'}
      margin={'10px 10px 10px 0px'}
      padding={'10px 10px 10px 10px'}
      overflowY={'auto'}
      overflowX={'hidden'}
      borderRadius={'10px'}
      style={{
        backgroundImage: 'linear-gradient(to bottom, #eceff6, rgba(255, 255, 255, 1))'
      }}
    >
      <MyBox borderRadius={'10px'} height={'100%'} width={'100%'} bg={'white'}>
        <Flex h={'calc(100vh - 160px)'}>
          {/* sideber */}
          <Box bg={'white'} height={'100%'} m={'10px'}>
            <GraphHistorySidebar
              w={'100%'}
              graphHistory={graphHistoryData}
              activeGraphId={activeGraphId}
            />
          </Box>
          <MyBox
            borderRadius={'10px'}
            m={'10px'}
            height={'100%'}
            width={'100%'}
            bg={'white'}
            mr={10}
          >
            {/* header */}
            <Box bg={'white'} height={'65px'} marginLeft={'10px'} marginTop={'5px'}>
              <Text fontSize="md" as="b" color={'black'} marginLeft={'10px'}>
                {graphTitle}图谱
              </Text>
              <Text color={'#555555'} fontSize="xs" marginTop={'4px'}>
                可以拖拽节点来查看不同部分的详细信息，并通过滚轮缩放来调整视图大小
              </Text>
            </Box>
            <MyBox
              height={'calc(100% - 65px)'}
              width={'100%'}
              border={'2px solid rgba(215, 0, 15, 1)'}
              borderRadius={'10px'}
            >
              {isLoading ? (
                <div
                  style={{
                    position: 'relative',
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <MyLoading size="xl" zIndex={1200} fixed={false} />
                </div>
              ) : (
                <EChartsWrapper renderer={'svg'} options={option} />
              )}
            </MyBox>
          </MyBox>
        </Flex>
      </MyBox>
    </MyBox>
  );
};

export default KnowledgeGraph;
export async function getServerSideProps(content: any) {
  return {
    props: {
      ...(await serviceSideProps(content, ['app', 'user']))
    }
  };
}
