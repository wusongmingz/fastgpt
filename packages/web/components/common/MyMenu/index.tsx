import React, { useMemo, useRef, useState } from 'react';
import {
  Menu,
  MenuList,
  MenuItem,
  Box,
  useOutsideClick,
  MenuButton,
  MenuItemProps,
  PlacementWithLogical
} from '@chakra-ui/react';
import MyDivider from '../MyDivider';
import type { IconNameType } from '../Icon/type';
import { useSystem } from '../../../hooks/useSystem';
import Avatar from '../Avatar';
import AIcon from '../../../../../projects/app/src/components/AIcon/AIcon';
export type MenuItemType = 'primary' | 'danger';

export type Props = {
  width?: number | string;
  offset?: [number, number];
  Button: React.ReactNode;
  trigger?: 'hover' | 'click';
  iconSize?: string;
  iconRadius?: string;

  placement?: PlacementWithLogical;
  menuList: {
    label?: string;
    children: {
      isActive?: boolean;
      type?: MenuItemType;
      icon?: IconNameType | string;
      color?: string;
      label: string | React.ReactNode;
      description?: string;
      onClick?: () => any;
      menuItemStyles?: MenuItemProps;
    }[];
  }[];
};

const MyMenu = ({
  width = 'auto',
  trigger = 'hover',
  offset,
  iconSize = '1rem',
  Button,
  menuList,
  iconRadius,
  placement = 'bottom-start'
}: Props) => {
  const typeMapStyle: Record<MenuItemType, MenuItemProps> = {
    primary: {
      _hover: {
        backgroundColor: 'rgb(226,227,234)',
        color: 'black'
      },
      _focus: {
        backgroundColor: 'rgb(226,227,234)',
        color: 'black'
      },
      _active: {
        backgroundColor: 'rgb(226,227,234)',
        color: 'black'
      }
    },
    danger: {
      color: 'red.600',
      _hover: {
        background: 'red.1'
      },
      _focus: {
        background: 'red.1'
      },
      _active: {
        background: 'red.1'
      }
    }
  };

  const { isPc } = useSystem();
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<any>();
  const [isOpen, setIsOpen] = useState(false);

  const formatTrigger = !isPc ? 'click' : trigger;

  useOutsideClick({
    ref: ref,
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
      offset={computeOffset}
      isOpen={isOpen}
      autoSelect={false}
      direction={'ltr'}
      // isLazy
      // lazyBehavior={'keepMounted'}
      placement={placement}
      computePositionOnMount
    >
      <Box
        ref={ref}
        onMouseEnter={() => {
          if (formatTrigger === 'hover') {
            setIsOpen(true);
          }
          clearTimeout(closeTimer.current);
        }}
        onMouseLeave={() => {
          if (formatTrigger === 'hover') {
            closeTimer.current = setTimeout(() => {
              setIsOpen(false);
            }, 100);
          }
        }}
      >
        <Box
          position={'relative'}
          onClickCapture={(e) => {
            e.stopPropagation();
            if (formatTrigger === 'click') {
              setIsOpen(!isOpen);
            }
          }}
        >
          <MenuButton
            w={'100%'}
            h={'100%'}
            position={'absolute'}
            top={0}
            right={0}
            bottom={0}
            left={0}
          />
          <Box
            color={isOpen ? 'primary.600' : ''}
            p="1"
            // bgColor={isOpen ? 'myGray.50' : ''}
          >
            {Button}
          </Box>
        </Box>
        <MenuList
          minW={isOpen ? `${width}px !important` : '80px'}
          ml={'0px'}
          mt={'-10px'}
          zIndex={100}
          maxW={'300px'}
          boxShadow={'3'}
          p={0}
          overflow={'hidden'}
        >
          {menuList.map((item, i) => {
            return (
              <Box key={i}>
                {/* {item.label && <Box fontSize={'sm'}>{item.label}</Box>} */}
                {/* {i !== 0 && <MyDivider h={'1.5px'} my={1} />} */}
                {item.children.map((child, index) => (
                  <MenuItem
                    key={index}
                    // borderRadius={'sm'}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (child.onClick) {
                        setIsOpen(false);
                        child.onClick();
                      }
                    }}
                    // py={2}
                    // px={3}
                    alignItems={'center'}
                    fontSize={'sm'}
                    color={child.isActive ? 'black' : 'black'}
                    // whiteSpace={'pre-wrap'}
                    _notLast={{ borderBottom: '1px solid #e0e0e0' }}
                    // borderBottom="1px solid #e0e0e0"
                    {...typeMapStyle[child.type || 'primary']}
                    {...child.menuItemStyles}
                    m={0}
                  >
                    {!!child.icon && (
                      <AIcon
                        name={child.icon as any}
                        color={child.color}
                        borderRadius={iconRadius}
                        fontSize={iconSize}
                        mr={3}
                      />
                    )}
                    <Box w={'100%'}>
                      <Box
                        w={'100%'}
                        color={child.description ? 'myGray.900' : 'inherit'}
                        fontSize={'sm'}
                      >
                        {child.label}
                      </Box>
                      {child.description && (
                        <Box color={'myGray.500'} fontSize={'mini'} w={'100%'}>
                          {child.description}
                        </Box>
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Box>
            );
          })}
        </MenuList>
      </Box>
    </Menu>
  );
};

export default React.memo(MyMenu);
