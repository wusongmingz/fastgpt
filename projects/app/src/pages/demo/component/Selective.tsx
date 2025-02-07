import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  RadioGroup,
  Stack,
  Radio,
  Button,
  Input,
  Box,
  Text
} from '@chakra-ui/react';
import { px } from 'framer-motion';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FolderModal: React.FC<FolderModalProps> = ({ isOpen, onClose }) => {
  const [value, setValue] = useState('');
  const [valueStyle, setValueStyle] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
  const [folderName, setFolderName] = useState('');

  const handleValueChange = (val: string) => {
    setValue(val);
  };

  const handleValueStyleChange = (val: string) => {
    setValueStyle(val);
  };

  const handleNextStep = () => {
    if (value === 'folder') {
      setShowKnowledgeModal(false);
      setShowFolderModal(true);
    } else if (value === 'knowledge') {
      setShowFolderModal(false);
      setShowKnowledgeModal(true);
    }
  };

  return (
    <>
      {!showFolderModal && !showKnowledgeModal ? (
        <Modal
          isOpen={isOpen}
          onClose={() => {
            onClose();
            setShowFolderModal(false);
            setShowKnowledgeModal(false);
          }}
          isCentered
          size="lg"
        >
          <ModalOverlay />
          <ModalContent borderRadius="10px" h="450px" w="520px">
            <Box borderBottom="1px solid #E2E8F0" py={1} bg="#e2e3ea" borderRadius="10px 10px 0 0">
              <ModalHeader fontSize="lg" py={1} height="40px"></ModalHeader>
            </Box>
            <ModalCloseButton />
            <ModalBody py={6} display="flex" justifyContent="center" alignItems="center">
              <RadioGroup onChange={handleValueChange} value={value}>
                <Stack>
                  <Radio value="folder" size="lg">
                    文件夹
                  </Radio>
                  <Radio value="knowledge" size="lg">
                    知识库
                  </Radio>
                </Stack>
              </RadioGroup>
            </ModalBody>
            <ModalFooter
              justifyContent="flex-end"
              // gap={4}
              borderTop="1px solid #e2e3ea"
              borderRadius="0 0 5px 5px"
            >
              <Box style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                <Button
                  bg="white"
                  color="black"
                  border="1px solid black"
                  onClick={() => {
                    onClose();
                    setShowFolderModal(false);
                    setShowKnowledgeModal(false);
                  }}
                  borderRadius="5px"
                >
                  取消
                </Button>
                <Button
                  bg="black"
                  color="white"
                  borderRadius="5px"
                  border="1px solid black"
                  onClick={handleNextStep}
                  _hover={{
                    bg: 'white',
                    color: 'black',
                    border: '1px solid black',
                    borderRadius: '5px'
                  }}
                >
                  下一步
                </Button>
              </Box>
            </ModalFooter>
          </ModalContent>
        </Modal>
      ) : showFolderModal ? (
        <Modal
          isOpen={showFolderModal}
          onClose={() => {
            setShowFolderModal(false);
            onClose();
          }}
          isCentered
          size="lg"
        >
          <ModalOverlay />
          <ModalContent borderRadius="10px" h="450px" w="520px">
            <Box borderBottom="1px solid #E2E8F0" py={1} bg="#e2e3ea" borderRadius="10px 10px 0 0">
              <ModalHeader fontSize="lg" py={1} height="40px">
                创建文件夹
              </ModalHeader>
            </Box>
            <ModalCloseButton />
            <ModalBody py={6}>
              <p>请输入文件夹名称</p>
              <Input
                placeholder=""
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
              />
            </ModalBody>

            <ModalFooter
              justifyContent="flex-end"
              gap={4}
              borderTop="1px solid #e2e3ea"
              borderRadius="0 0 5px 5px"
            >
              <Button
                bg="white"
                color="black"
                border="1px solid black"
                onClick={() => {
                  setShowFolderModal(false);
                  onClose();
                }}
                borderRadius="5px"
                _hover={{
                  bg: 'white',
                  color: 'black',
                  border: '1px solid black',
                  borderRadius: '5px'
                }}
              >
                取消
              </Button>
              <Button
                bg="black"
                color="white"
                borderRadius="5px"
                border="1px solid black"
                _hover={{
                  bg: 'white',
                  color: 'black',
                  border: '1px solid black',
                  borderRadius: '5px'
                }}
              >
                确认
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      ) : (
        <Modal
          isOpen={showKnowledgeModal}
          onClose={() => {
            setShowKnowledgeModal(false);
            onClose();
          }}
          isCentered
          size="lg"
        >
          <ModalOverlay />
          <ModalContent borderRadius="10px" h="450px" w="520px">
            <Box borderBottom="1px solid #E2E8F0" py={1} bg="#e2e3ea" borderRadius="10px 10px 0 0">
              <ModalHeader fontSize="lg" py={1} height="40px">
                创建知识库
              </ModalHeader>
            </Box>
            <ModalCloseButton />
            <ModalBody py={6}>
              <p>*请输入知识库名称</p>
              <Input
                placeholder=""
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
              />
              <p>*知识库类型</p>
              <RadioGroup onChange={handleValueStyleChange} value={valueStyle}>
                <Stack>
                  <Radio size="lg" value="general">
                    <Box border="1px solid #e2e3ea" borderRadius="5px" p={2}>
                      <Text fontSize="md">通用知识库</Text>
                      <Text fontSize="sm" w={360}>
                        可通过导入文件、网页链接或手动录入形式构建知识库
                      </Text>
                    </Box>
                  </Radio>
                  <Radio size="lg" value="graph">
                    <Box border="1px solid  #e2e3ea" borderRadius="5px" p={2}>
                      <Text fontSize="md">图知识库</Text>
                      <Text fontSize="sm" w={360}>
                        通过向量化建立节点,关系的联系将RAG准确度提高高高
                      </Text>
                    </Box>
                  </Radio>
                </Stack>
              </RadioGroup>
              <p>*选择知识库标签颜色</p>
              <Box display="flex" justifyContent="space-between" mt={2}>
                {[
                  '#002FA7',
                  '#008C8C',
                  '#003153',
                  '#81D8CF',
                  '#B05923',
                  '#900021',
                  '#E60000',
                  '#FBD26A',
                  '#432913',
                  '#432913'
                ].map((color) => (
                  <Box
                    key={color}
                    bg={color}
                    w="30px"
                    h="30px"
                    // borderRadius="5px"
                    cursor="pointer"
                    _hover={{
                      border: '2px solid gray'
                    }}
                  />
                ))}
              </Box>
            </ModalBody>

            <ModalFooter
              justifyContent="flex-end"
              gap={4}
              borderTop="1px solid #e2e3ea"
              borderRadius="0 0 5px 5px"
            >
              <Button
                bg="#fff"
                color="black"
                border="1px solid black"
                onClick={() => {
                  setShowKnowledgeModal(false);
                  onClose();
                }}
                borderRadius="5px"
                _hover={{
                  bg: '#fff',
                  color: 'black',
                  border: '1px solid black',
                  borderRadius: '5px'
                }}
              >
                取消
              </Button>
              <Button
                bg="black"
                color="white"
                borderRadius="5px"
                border="1px solid black"
                _hover={{
                  bg: 'white',
                  color: 'black',
                  border: '1px solid black',
                  borderRadius: '5px'
                }}
              >
                确认
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default FolderModal;
