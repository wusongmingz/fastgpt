import {
  Box,
  Card,
  CardBody,
  CardHeader,
  CardProps,
  CloseButton,
  Flex,
  Text
} from '@chakra-ui/react';

function UserInfoCard({
  record,
  onClose,
  ...props
}: CardProps & { record: any; onClose: () => void }) {
  return (
    <Card
      maxW={'300px'}
      minH={['200px', '300px']}
      position={'absolute'}
      right={0}
      top={0}
      {...props}
    >
      <CardHeader bgColor={'#E2E3EA'} px={2} py={0} borderRadius={'md'} h={'2.5rem'}>
        <Flex w={'100%'} height={'100%'} alignItems={'center'} justifyContent={'space-between'}>
          <Text>用户详情</Text>
          <CloseButton onClick={onClose} />
        </Flex>
      </CardHeader>
      <CardBody>
        <Flex direction={'column'} gap={'1rem'}>
          <Flex gap={'1rem'}>
            <Text>登录用户名：</Text>
            <Text>{record.name}</Text>
          </Flex>
          {record.groups.length > 0 && (
            <Flex gap={'1rem'}>
              <Box>所在团队：</Box>
              <Text whiteSpace={'wrap'} wordBreak={'normal'} textAlign={'left'}>
                {record.groups.map((group: any) => group.name).join('、')}
              </Text>
            </Flex>
          )}
          <Flex gap={'1rem'}>
            <Text>创建时间：</Text>
            <Text>{record.createTime}</Text>
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
}

export default UserInfoCard;
