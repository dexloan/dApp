import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

const fadeIn = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const Ellipsis = styled.span<{ delay?: number }>`
  animation: ${fadeIn} 0.5s ease-in-out;
  animation-delay: ${({ delay = 0 }) => delay}ms;
`;

export const EllipsisProgress = () => {
  return (
    <>
      <Ellipsis>.</Ellipsis>
      <Ellipsis delay={600}>.</Ellipsis>
      <Ellipsis delay={1200}>.</Ellipsis>
    </>
  );
};
