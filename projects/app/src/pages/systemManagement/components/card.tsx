import { Box, Flex, Grid, Tooltip } from '@chakra-ui/react';
import MyBox from '@fastgpt/web/components/common/MyBox';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';

interface Props<T = any> {
  title: string;
  data: T[];
  isLoading: boolean;
}

const Card = ({ title, data, isLoading }: Props) => {
  return (
    <MyBox h={'100%'} isLoading={isLoading}>
      <Box
        display={'flex'}
        alignItems={'center'}
        justifyContent={'center'}
        h={'30px'}
        borderRadius={'md'}
        bgColor={'#EFEFF9'}
      >
        {title}
      </Box>
      <Grid p={2} gap={2} gridTemplateColumns={'repeat(2, 1fr)'}>
        {data.map((item, index) => (
          <MyTooltip key={index} label={item.name} shouldWrapChildren={false}>
            <Box
              h={'30px'}
              textAlign={'center'}
              border={'1px solid'}
              borderColor={'#91C6DE'}
              borderRadius={'md'}
              fontSize={['12px', '16px']}
              className="textEllipsis"
            >
              {item.name}
            </Box>
          </MyTooltip>
        ))}
      </Grid>
    </MyBox>
  );
};

export default Card;
