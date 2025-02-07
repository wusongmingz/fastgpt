import { useSystemStore } from '@/web/common/system/useSystemStore';
import { Flex, Table, Thead, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/react';
import {
  DatasetSearchModeEnum,
  DatasetSearchModeMap
} from '@fastgpt/global/core/dataset/constants';
import { useTranslation } from 'next-i18next';
import React, { useMemo } from 'react';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { getWebLLMModel } from '@/web/common/system/utils';

const SearchParamsTip = ({
  searchMode,
  responseEmptyText
}: {
  searchMode: `${DatasetSearchModeEnum}`;
  responseEmptyText?: string;
}) => {
  const { t } = useTranslation();

  const hasEmptyResponseMode = responseEmptyText !== undefined;

  return (
    <TableContainer borderRadius={'lg'}>
      <Table fontSize={'xs'} overflow={'overlay'}>
        <Thead>
          <Tr bg={'transparent !important'}>
            <Th fontSize={'mini'} justifyContent={'center'} textAlign={'center'}>
              {t('common:core.dataset.search.search mode')}
            </Th>

            {hasEmptyResponseMode && (
              <Th fontSize={'mini'}>{t('common:core.dataset.search.Empty result response')}</Th>
            )}
          </Tr>
        </Thead>
        <Tbody>
          <Tr color={'myGray.800'}>
            <Td pt={0} pb={2} justifyContent={'center'} textAlign={'center'}>
              <Flex alignItems={'center'} justifyContent={'center'} textAlign={'center'}>
                {t(DatasetSearchModeMap[searchMode]?.title as any)}
              </Flex>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default React.memo(SearchParamsTip);
