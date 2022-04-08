import React, {
  ReactNode,
  FC,
  useRef,
  useState,
  CSSProperties,
  useCallback,
  useEffect,
} from 'react';
import { createPortal } from 'react-dom';
import throttle from 'lodash.throttle';
import PropTypes from 'prop-types';

export interface StickitProps {
  children: ReactNode;
  boundary?: {
    top?: string | null;
    bottom?: string | null;
  };
  disabled?: boolean;
  throttleTime?: number;
  stickyWrapperProps?: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
}

export const Stickit: FC<StickitProps> = ({
  children,
  boundary: { top: topBoundarySelector, bottom: bottomBoundarySelector } = {},
  disabled = false,
  throttleTime = 50,
  stickyWrapperProps = {},
}) => {
  const originalRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const [styles, setStyles] = useState<CSSProperties>({});
  const isSticky = styles.position === 'fixed' || styles.position === 'absolute';

  const handleScrollEvent = useCallback(
    () =>
      throttle(() => {
        if (!originalRef.current) return;

        const bottomBoundaryElement =
          (bottomBoundarySelector &&
            (document.querySelector(bottomBoundarySelector) as HTMLElement)) ||
          null;

        const originalRect = originalRef.current.getBoundingClientRect();
        const topBoundaryRect =
          (topBoundarySelector &&
            document.querySelector(topBoundarySelector)?.getBoundingClientRect()) ||
          null;

        if (stickyRef.current && bottomBoundaryElement) {
          const bottomBoundaryRect = bottomBoundaryElement.getBoundingClientRect();
          const stickyRect = stickyRef.current.getBoundingClientRect();

          if (
            stickyRect.bottom >= Math.floor(bottomBoundaryRect.top) &&
            stickyRect.top <= (topBoundaryRect?.bottom ?? 0)
          ) {
            setStyles({
              position: 'absolute',
              width: originalRect.width,
              top: bottomBoundaryElement.offsetTop - stickyRect.height,
            });
            return;
          }
        }

        if (originalRect.top < (topBoundaryRect?.bottom ?? 0)) {
          setStyles({
            position: 'fixed',
            width: originalRect.width,
            top: topBoundaryRect?.bottom ?? 0,
          });
          return;
        }

        setStyles({});
      }, throttleTime)(),
    [topBoundarySelector, bottomBoundarySelector, throttleTime]
  );

  useEffect(() => {
    if (!disabled) {
      window.addEventListener('scroll', handleScrollEvent);
    }

    return () => {
      window.removeEventListener('scroll', handleScrollEvent);
    };
  }, [handleScrollEvent, disabled]);

  return (
    <>
      {isSticky &&
        createPortal(
          <div {...stickyWrapperProps} ref={stickyRef} style={styles}>
            {children}
          </div>,
          document.body
        )}
      <div ref={originalRef} style={{ opacity: isSticky ? 0 : undefined }}>
        {children}
      </div>
    </>
  );
};

Stickit.propTypes = {
  children: PropTypes.node.isRequired,
  boundary: PropTypes.shape({
    top: PropTypes.string,
    bottom: PropTypes.string,
  }),
  disabled: PropTypes.bool,
  throttleTime: PropTypes.number,
  // eslint-disable-next-line react/forbid-prop-types
  stickyWrapperProps: PropTypes.object,
};

Stickit.defaultProps = {
  boundary: {},
  disabled: false,
  throttleTime: 50,
  stickyWrapperProps: {},
};
