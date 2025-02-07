import {
  Avatar,
  Box,
  Divider,
  Flex,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuItemProps,
  MenuList,
  PlacementWithLogical,
  useOutsideClick
} from '@chakra-ui/react';
import MyIcon from '@fastgpt/web/components/common/Icon';
import { useSystem } from '@fastgpt/web/hooks/useSystem';
import React, { useMemo, useRef, useState } from 'react';

type MenuItemType = 'primary' | 'danger';

export interface AMenuProps {
  width?: number | string;
  offset?: [number, number];
  trigger?: 'hover' | 'click';
  iconSize?: string;
  iconRadius?: string;

  placement?: PlacementWithLogical;
  menulist: {
    label?: string;
    children: {
      isActive?: boolean;
      type?: MenuItemType;
      // TODO: 换为自己Icon
      icon?: JSX.Element | string;
      label: string | React.ReactNode;
      description?: string;
      onClick?: () => any;
      menuItemStyles?: MenuItemProps;
    }[];
  }[];
}

function AMenu({ width = 'auto', offset, menulist, placement = 'bottom-start' }: AMenuProps) {
  const iconMap: Record<string, JSX.Element> = {
    rename: <Avatar src="/imgs/images/picture/edit.png" w={'1rem'} height={'1rem'} />,
    delete: <Avatar src="/imgs/images/picture/delete.png" w={'1rem'} height={'1rem'} />,
    permission: <Avatar src="/imgs/images/picture/permission.png" w={'1rem'} height={'1rem'} />
  };

  const { isPc } = useSystem();
  const ref = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useOutsideClick({
    ref,
    handler: () => {
      setIsOpen(false);
    }
  });

  const computeOffset = useMemo<[number, number]>(() => {
    if (offset) return offset;
    if (typeof width === 'number') return [-width / 2, 5];
    return [0, 5];
  }, [offset]);

  return (
    <Menu
      isOpen={isOpen}
      autoSelect={false}
      direction="ltr"
      isLazy
      lazyBehavior="keepMounted"
      placement={placement}
      computePositionOnMount
      offset={computeOffset}
    >
      <MenuButton
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <MyIcon
          className="icon"
          name={'more'}
          h={'20px'}
          w={'20px'}
          px={1}
          py={1}
          borderRadius={'md'}
          cursor={'pointer'}
        />
      </MenuButton>
      <MenuList
        minW={isOpen ? `${width}px` : '80px'}
        zIndex={100}
        maxW={'300px'}
        borderRadius={'lg'}
      >
        {menulist.map((menu, index) =>
          menu.children.map((item, i) => (
            <Box key={i} w={'100%'}>
              <MenuItem
                minH={'30px'}
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.onClick) {
                    setIsOpen(false);
                    item.onClick();
                  }
                }}
                fontSize={'sm'}
                _hover={{ bgColor: 'rgb(226, 227, 234)' }}
              >
                <Flex w={'100%'} alignItems={'center'} gap={'0.5rem'}>
                  {typeof item.icon === 'string' ? iconMap[item.icon] : item.icon}
                  <Box>{item.label}</Box>
                </Flex>
              </MenuItem>

              {(index !== menulist.length - 1 || i !== menu.children.length - 1) && (
                <Divider h={'1px'} bgColor={'rgb(226, 227, 234)'} margin={'0'} />
              )}
            </Box>
          ))
        )}
      </MenuList>
    </Menu>
  );
}

export default React.memo(AMenu);
