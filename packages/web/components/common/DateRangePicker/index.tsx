import React, { useState, useMemo, useRef } from 'react';
import { Box, Card, Flex, useTheme, useOutsideClick, Button } from '@chakra-ui/react';
import { addDays, format } from 'date-fns';
import { type DateRange, DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import zhCN from 'date-fns/locale/zh-CN';
import { useTranslation } from 'next-i18next';
import MyIcon from '../Icon';

const DateRangePicker = ({
  onChange,
  onSuccess,
  position = 'bottom',
  defaultDate = {
    from: addDays(new Date(), -30),
    to: new Date()
  }
}: {
  onChange?: (date: DateRange) => void;
  onSuccess?: (date: DateRange) => void;
  position?: 'bottom' | 'top';
  defaultDate?: DateRange;
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const OutRangeRef = useRef(null);
  const [range, setRange] = useState<DateRange | undefined>(defaultDate);
  const [showSelected, setShowSelected] = useState(false);

  const formatSelected = useMemo(() => {
    if (range?.from && range.to) {
      return `${format(range.from, 'y-MM-dd')} ~ ${format(range.to, 'y-MM-dd')}`;
    }
    return `${format(new Date(), 'y-MM-dd')} ~ ${format(new Date(), 'y-MM-dd')}`;
  }, [range]);

  useOutsideClick({
    ref: OutRangeRef,
    handler: () => {
      setShowSelected(false);
    }
  });

  return (
    <Box position={'relative'} ref={OutRangeRef}>
      <Flex
        border={theme.borders.base}
        px={3}
        py={1}
        borderRadius={'sm'}
        cursor={'pointer'}
        bg={'myGray.100'}
        fontSize={'sm'}
        onClick={() => setShowSelected(true)}
      >
        <Box color={'myGray.600'} fontWeight={'400'}>
          {formatSelected}
        </Box>
        <MyIcon ml={2} name={'date'} w={'16px'} color={'myGray.600'} />
      </Flex>
      {showSelected && (
        <Card
          position={'absolute'}
          zIndex={1}
          left={'-100px'}
          css={{
            '--rdp-background-color': '#d6e8ff' as any,
            '--rdp-accent-color': '#d7000f' as any
            // '--rdp-range_middle-background-color': '#d7000f'
          }}
          {...(position === 'top'
            ? {
                bottom: '40px'
              }
            : {})}
        >
          <DayPicker
            locale={zhCN}
            id="test"
            mode="range"
            defaultMonth={defaultDate.to}
            selected={range}
            disabled={[
              { from: new Date(2022, 3, 1), to: addDays(new Date(), -90) },
              { from: addDays(new Date(), 1), to: new Date(2099, 1, 1) }
            ]}
            onSelect={(date) => {
              if (date?.from === undefined) {
                date = {
                  from: range?.from,
                  to: range?.from
                };
              }
              if (date?.to === undefined) {
                date.to = date.from;
              }
              setRange(date);
              onChange && onChange(date);
            }}
            footer={
              <Flex justifyContent={'flex-end'}>
                <Button
                  // variant={'outline'}
                  variant={'whiteCommon'}
                  size={'sm'}
                  w="80px"
                  mr={2}
                  onClick={() => setShowSelected(false)}
                >
                  {t('common:common.Close')}
                </Button>
                <Button
                  variant={'blackCommon'}
                  size={'sm'}
                  w={'80px'}
                  onClick={() => {
                    onSuccess && onSuccess(range || defaultDate);
                    setShowSelected(false);
                  }}
                >
                  {t('common:common.Confirm')}
                </Button>
              </Flex>
            }
          />
        </Card>
      )}
    </Box>
  );
};

export default DateRangePicker;
export type DateRangeType = DateRange;
