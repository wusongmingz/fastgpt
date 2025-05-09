import React, { useMemo, useState } from 'react';
import { Flex, useDisclosure, Box } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import type { SearchDataResponseItemType } from '@fastgpt/global/core/dataset/type';
import dynamic from 'next/dynamic';
import MyTag from '@fastgpt/web/components/common/Tag/index';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';
import { getSourceNameIcon } from '@fastgpt/global/core/dataset/utils';
import ChatBoxDivider from '@/components/core/chat/Divider';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useSystem } from '@fastgpt/web/hooks/useSystem';
import { ChatSiteItemType } from '@fastgpt/global/core/chat/type';
import { addStatisticalDataToHistoryItem } from '@/global/core/chat/utils';
import { useSize } from 'ahooks';
import { useContextSelector } from 'use-context-selector';
import { ChatBoxContext } from '../Provider';
import GraphModal from './GraphModal.';

const QuoteModal = dynamic(() => import('./QuoteModal'));
const ContextModal = dynamic(() => import('./ContextModal'));
const WholeResponseModal = dynamic(() => import('../../../components/WholeResponseModal'));

const ResponseTags = ({
  showTags,
  historyItem
}: {
  showTags: boolean;
  historyItem: ChatSiteItemType;
}) => {
  const { isPc } = useSystem();
  const { t } = useTranslation();
  const quoteListRef = React.useRef<HTMLDivElement>(null);
  const dataId = historyItem.dataId;

  const {
    totalQuoteList: quoteList = [],
    llmModuleAccount = 0,
    totalRunningTime: runningTime = 0,
    historyPreviewLength = 0,
    datasetSearchNodeQuoteList,
    tokensSum
  } = useMemo(() => addStatisticalDataToHistoryItem(historyItem), [historyItem]);

  const [quoteModalData, setQuoteModalData] = useState<{
    rawSearch: SearchDataResponseItemType[];
    metadata?: {
      collectionId: string;
      sourceId?: string;
      sourceName: string;
    };
  }>();
  const [quoteFolded, setQuoteFolded] = useState<boolean>(true);

  const chatType = useContextSelector(ChatBoxContext, (v) => v.chatType);
  const showRawSource = useContextSelector(ChatBoxContext, (v) => v.showRawSource);
  const notSharePage = useMemo(() => chatType !== 'share', [chatType]);

  const {
    isOpen: isOpenWholeModal,
    onOpen: onOpenWholeModal,
    onClose: onCloseWholeModal
  } = useDisclosure();
  const {
    isOpen: isOpenGraphModal,
    onOpen: onOpenGraphModal,
    onClose: onCloseGraphModal
  } = useDisclosure();
  const {
    isOpen: isOpenContextModal,
    onOpen: onOpenContextModal,
    onClose: onCloseContextModal
  } = useDisclosure();
  useSize(quoteListRef);
  const quoteIsOverflow = quoteListRef.current
    ? quoteListRef.current.scrollHeight > (isPc ? 50 : 55)
    : true;

  const sourceList = useMemo(() => {
    return Object.values(
      quoteList.reduce((acc: Record<string, SearchDataResponseItemType[]>, cur) => {
        if (!acc[cur.collectionId]) {
          acc[cur.collectionId] = [cur];
        }
        return acc;
      }, {})
    )
      .flat()
      .map((item) => ({
        sourceName: item.sourceName,
        sourceId: item.sourceId,
        icon: getSourceNameIcon({ sourceId: item.sourceId, sourceName: item.sourceName }),
        collectionId: item.collectionId
      }));
  }, [quoteList]);

  const notEmptyTags =
    quoteList.length > 0 ||
    (llmModuleAccount === 1 && notSharePage) ||
    (llmModuleAccount > 1 && notSharePage) ||
    (isPc && runningTime > 0) ||
    notSharePage;

  return !showTags ? null : (
    <>
      {/* quote */}
      {sourceList.length > 0 && (
        <>
          <Flex justifyContent={'space-between'} alignItems={'center'}>
            <Box width={'100%'}>
              <ChatBoxDivider icon="core/chat/quoteFill" text={t('common:core.chat.Quote')} />
            </Box>
            {quoteFolded && quoteIsOverflow && (
              <MyIcon
                _hover={{ color: 'primary.500', cursor: 'pointer' }}
                name="core/chat/chevronDown"
                w={'14px'}
                onClick={() => setQuoteFolded(!quoteFolded)}
              />
            )}
          </Flex>

          <Flex
            ref={quoteListRef}
            alignItems={'center'}
            position={'relative'}
            flexWrap={'wrap'}
            gap={2}
            maxH={quoteFolded && quoteIsOverflow ? ['50px', '55px'] : 'auto'}
            overflow={'hidden'}
            _after={
              quoteFolded && quoteIsOverflow
                ? {
                    content: '""',
                    position: 'absolute',
                    zIndex: 2,
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '50%',
                    background:
                      'linear-gradient(to bottom, rgba(247,247,247,0), rgba(247, 247, 247, 0.91))'
                  }
                : {}
            }
          >
            {sourceList.map((item) => {
              return (
                // <MyTooltip  label={t('common:core.chat.quote.Read Quote')}>
                <Flex
                  key={item.collectionId}
                  alignItems={'center'}
                  fontSize={'xs'}
                  // border={'sm'}
                  py={1.5}
                  px={2}
                  borderRadius={'sm'}
                  _hover={{
                    '.controller': {
                      display: 'flex'
                    },
                    bg: '#eceff6'
                  }}
                  overflow={'hidden'}
                  position={'relative'}
                  cursor={'pointer'}
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuoteModalData({
                      rawSearch: quoteList,
                      metadata: {
                        collectionId: item.collectionId,
                        sourceId: item.sourceId,
                        sourceName: item.sourceName
                      }
                    });
                  }}
                >
                  <MyIcon name={item.icon as any} mr={1} flexShrink={0} w={'18px'} />
                  <Box className="textEllipsis3" wordBreak={'break-all'} flex={'1 0 0'}>
                    {item.sourceName}
                  </Box>
                </Flex>
                // </MyTooltip>
              );
            })}
            {!quoteFolded && (
              <MyIcon
                position={'absolute'}
                bottom={0}
                right={0}
                _hover={{ color: 'primary.500', cursor: 'pointer' }}
                name="core/chat/chevronUp"
                w={'14px'}
                onClick={() => setQuoteFolded(!quoteFolded)}
              />
            )}
          </Flex>
        </>
      )}

      {notEmptyTags && (
        <Flex alignItems={'center'} mt={3} flexWrap={'wrap'} gap={2}>
          {quoteList.length > 0 && (
            <MyTooltip label={t('chat:view_citations')}>
              <MyTag
                colorSchema="yinyong"
                type="borderSolid"
                cursor={'pointer'}
                onClick={() => setQuoteModalData({ rawSearch: quoteList })}
              >
                {t('chat:citations', { num: quoteList.length })}
              </MyTag>
            </MyTooltip>
          )}
          {llmModuleAccount === 1 && notSharePage && (
            <>
              {historyPreviewLength > 0 && (
                <MyTooltip label={t('chat:click_contextual_preview')}>
                  <MyTag
                    colorSchema="shangxiawen"
                    cursor={'pointer'}
                    type="borderSolid"
                    onClick={onOpenContextModal}
                  >
                    {t('chat:contextual', { num: historyPreviewLength })}
                  </MyTag>
                </MyTooltip>
              )}
            </>
          )}
          {llmModuleAccount > 1 && notSharePage && (
            <MyTag type="borderSolid" colorSchema="blue">
              {t('chat:multiple_AI_conversations')}
            </MyTag>
          )}
          {isPc && runningTime > 0 && (
            <MyTooltip label={t('chat:module_runtime_and')}>
              <MyTag colorSchema="time" type="borderSolid" cursor={'default'}>
                {runningTime}s
              </MyTag>
            </MyTooltip>
          )}
          {tokensSum && tokensSum > 0 && (
            <MyTag colorSchema="token" type="borderSolid">
              {tokensSum}Tokens
            </MyTag>
          )}
          {datasetSearchNodeQuoteList && datasetSearchNodeQuoteList?.length > 0 && (
            <MyTag
              colorSchema="tupu"
              type="borderSolid"
              cursor={'pointer'}
              onClick={onOpenGraphModal}
            >
              {t('common:core.chat.response.graph map')}
            </MyTag>
          )}

          {notSharePage && (
            <MyTooltip label={t('common:core.chat.response.Read complete response tips')}>
              <MyTag
                colorSchema="detail"
                type="borderSolid"
                cursor={'pointer'}
                onClick={onOpenWholeModal}
              >
                {t('common:core.chat.response.Read complete response')}
              </MyTag>
            </MyTooltip>
          )}
        </Flex>
      )}

      {!!quoteModalData && (
        <QuoteModal
          {...quoteModalData}
          canEditDataset={notSharePage}
          showRawSource={showRawSource}
          onClose={() => setQuoteModalData(undefined)}
        />
      )}
      {isOpenContextModal && <ContextModal dataId={dataId} onClose={onCloseContextModal} />}
      {isOpenWholeModal && <WholeResponseModal dataId={dataId} onClose={onCloseWholeModal} />}
      {isOpenGraphModal && (
        <GraphModal quoteList={datasetSearchNodeQuoteList} onClose={onCloseGraphModal}></GraphModal>
      )}
    </>
  );
};

export default React.memo(ResponseTags);
