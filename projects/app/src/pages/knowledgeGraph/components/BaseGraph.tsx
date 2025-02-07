'use client';
// @ts-nocheck
import React, {
  ForwardedRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState
} from 'react';
import MyLoading from '@fastgpt/web/components/common/MyLoading';
import { EChartsType } from 'echarts/core';

/**
 * echarts 系列类型和组件
 */
import * as echarts from 'echarts/core';
import { GraphChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  // 数据集组件
  DatasetComponent,
  // 内置数据转换器组件 (filter, sort)
  TransformComponent
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers';

/**
 * echarts 系列类型和组件的类型声明
 */
import type {
  // 系列类型的定义后缀都为 SeriesOption
  GraphSeriesOption
} from 'echarts/charts';
import type {
  // 组件类型的定义后缀都为 ComponentOption
  TitleComponentOption,
  TooltipComponentOption,
  GridComponentOption,
  DatasetComponentOption,
  LegendComponentOption
} from 'echarts/components';
import type { ComposeOption } from 'echarts/core';

// 通过 ComposeOption 来组合出包含组件类型和系列类型的 Option 类型
export type ECOption = ComposeOption<
  | GraphSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | DatasetComponentOption
  | LegendComponentOption
>;

/**
 * echarts 注册系列类型和组件
 */
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  GraphChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
  SVGRenderer,
  LegendComponent
]);

/**
 * ref、props 类型定义
 */
export type EChartsRendererType = 'svg' | 'canvas';

export type EChartsRef = {
  getEChartsInstance(): EChartsType | undefined;
};

export type EChartsProps = {
  options: ECOption;
  height?: number;
  width?: number;
  renderer: EChartsRendererType;
  loading?: boolean;
};

/**
 * 默认 props 值
 */
const defaultProps: EChartsProps = {
  options: {},
  height: 300,
  width: 100,
  renderer: 'canvas',
  loading: false // 默认不显示loading
};

/**
 * ForwardRef 函数组件
 */
const EChartsWrapper: React.ForwardRefRenderFunction<EChartsRef, EChartsProps> = (
  props: EChartsProps = defaultProps,
  ref: ForwardedRef<EChartsRef>
) => {
  const [isMounted, setIsMounted] = useState(false); // 确保useEffect只在挂载时执行一次

  // echarts 挂载DOM节点
  const echartsRef = useRef<HTMLDivElement>(null);
  // echarts 实例
  const echartsInstance = useRef<EChartsType>();

  // 初始化 echarts (影响因素: props.options、ref)
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }

    if (isMounted && !props.loading && echartsRef.current) {
      // 每次都进行赋值，避免 echart 初次初始化失败导致无法后续判断错误无法进行初始化
      echartsInstance.current = echarts.getInstanceByDom(echartsRef.current);
      if (!echartsInstance.current) {
        echartsInstance.current = echarts.init(echartsRef.current, undefined, {
          renderer: props.renderer
        });
      }

      // 设置配置项
      if (props.options) echartsInstance.current?.setOption(props.options);

      return () => {
        // 容器销毁时，销毁实例避免内存溢出
        echartsInstance.current?.dispose();
      };
    }
  }, [echartsRef, props.options, props.loading, isMounted]);

  // 防抖函数
  function debounce(func: (...args: any[]) => void, delay: number) {
    let timerId: ReturnType<typeof setTimeout>;
    return function (this: any, ...args: any[]) {
      // 添加 this 的类型注解
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  // 重新适配窗口，开启过渡动画
  const resize = () => {
    echartsInstance.current?.resize({
      animation: { duration: 300 }
    });
  };

  // 重新适配增加防抖处理
  const debounceResize = debounce(resize, 300);

  // 监听窗口大小执行重绘 (影响因素: props.options)
  useEffect(() => {
    window.addEventListener('resize', debounceResize);
    return () => {
      window.removeEventListener('resize', debounceResize);
    };
  }, [props.options]);

  // 监听窗口位置参数 (影响因素: props.height、props.width)
  useLayoutEffect(() => {
    debounceResize();
  }, [props.height, props.width]);

  useImperativeHandle(ref, () => ({
    // 将 echarts 实例暴露给父组件
    getEChartsInstance: () => {
      return echartsInstance.current;
    }
  }));

  // 根据loading属性决定渲染内容
  if (props.loading) {
    return <MyLoading />;
  }

  return (
    <div
      ref={echartsRef}
      style={{
        width: props.width ? `${props.width}px` : '100%',
        height: props.height ? `${props.height}px` : '100%'
      }}
    ></div>
  );
};

export default React.forwardRef(EChartsWrapper as typeof EChartsWrapper);
