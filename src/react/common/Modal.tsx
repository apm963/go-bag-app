import { css } from 'emotion';

export const style = {
	backdrop: css`
		position: fixed;
		z-index: 1040;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: #000;
		opacity: 0.5;
	`,
	modal: css`
		/* Vertically center (found here: https://github.com/react-bootstrap/react-bootstrap/issues/995#issuecomment-122005744) */
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) !important;
		
		width: 400;
		z-index: 1040;
		border: 1px solid #e5e5e5;
		background-color: white;
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
		padding: 20;
	`,
};
