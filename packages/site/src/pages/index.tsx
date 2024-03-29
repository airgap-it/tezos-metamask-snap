import { useContext, useState } from 'react';
import styled from 'styled-components';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import {
  sendClearRpc,
  sendGetAccount,
  sendGetRpc,
  sendOperationRequest,
  sendSetRpc,
  sendSignRequest,
} from '../utils';
import { InstallFlaskButton, SendHelloButton, Card } from '../components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);
  const [address, setAddress] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [opResult, setOpResult] = useState('');
  const [signResult, setSignResult] = useState('');
  const [setRpcResult, setSetRpcResult] = useState('');
  const [getRpcResult, setGetRpcResult] = useState('');
  const [clearRpcResult, setClearRpcResult] = useState('');

  // const handleConnectClick = async () => {
  //   try {
  //     await connectSnap();
  //     const installedSnap = await getSnap();

  //     dispatch({
  //       type: MetamaskActions.SetInstalled,
  //       payload: installedSnap,
  //     });
  //   } catch (e) {
  //     console.error(e);
  //     dispatch({ type: MetamaskActions.SetError, payload: e });
  //   }
  // };

  const handleSendHelloClick = async () => {
    try {
      const account = await sendGetAccount();
      setAddress(account.address);
      setPublicKey(account.publicKey);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleSendOperationRequestClick = async () => {
    try {
      setOpResult(await sendOperationRequest(address));
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleSendSignRequestClick = async () => {
    try {
      setSignResult(await sendSignRequest());
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleSendGetRpcClick = async () => {
    try {
      setGetRpcResult(await sendGetRpc());
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleSendSetRpcClick = async () => {
    try {
      setSetRpcResult(await sendSetRpc());
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleSendClearRpcClick = async () => {
    try {
      setClearRpcResult(await sendClearRpc());
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <Container>
      <Heading>
        Welcome to the <Span>Tezos + MetaMask Demo</Span>
      </Heading>
      <Subtitle>A Snap to add Tezos support to MetaMask</Subtitle>
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
        {!state.isFlask && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {/* {!state.installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!state.isFlask}
                />
              ),
            }}
            disabled={!state.isFlask}
          />
        )} */}
        {/* {shouldDisplayReconnectButton(state.installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={handleConnectClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            disabled={!state.installedSnap}
          />
        )} */}
        <Card
          content={{
            title: 'Request Address',
            description: 'Get the Tezos Public Key and Address from MetaMask',
            data: {
              publicKey,
              address,
            },
            button: (
              <SendHelloButton
                onClick={handleSendHelloClick}
                disabled={!state.installedSnap}
              />
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={true}
        />
        <Card
          content={{
            title: 'Send Operation Request',
            description: 'Send an operation to MetaMask to be signed.',
            data: {
              payload: {
                kind: 'transaction',
                destination: address,
                amount: '1',
              },
              result: opResult,
            },
            button: (
              <SendHelloButton
                onClick={handleSendOperationRequestClick}
                disabled={!state.installedSnap}
              />
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={true}
        />
        <Card
          content={{
            title: 'Send Sign Payload Request',
            description: 'Send a payload to MetaMask to be signed.',
            data: {
              payload: '05010000004254657a6f73205...',
              result: signResult,
            },
            button: (
              <SendHelloButton
                onClick={handleSendSignRequestClick}
                disabled={!state.installedSnap}
              />
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={true}
        />
        <Card
          content={{
            title: 'Get RPC',
            description: 'Get the RPC that MetaMask is currently using',
            data: {
              result: getRpcResult,
            },
            button: (
              <SendHelloButton
                onClick={handleSendGetRpcClick}
                disabled={!state.installedSnap}
              />
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={true}
        />
        <Card
          content={{
            title: 'Set RPC',
            description: 'Set the RPC to another value',
            data: {
              network: 'mainnet',
              result: setRpcResult,
            },
            button: (
              <SendHelloButton
                onClick={handleSendSetRpcClick}
                disabled={!state.installedSnap}
              />
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={true}
        />
        <Card
          content={{
            title: 'Clear RPC',
            description:
              'Clear the RPC that MetaMask is currently using and use the default again',
            data: {
              result: clearRpcResult,
            },
            button: (
              <SendHelloButton
                onClick={handleSendClearRpcClick}
                disabled={!state.installedSnap}
              />
            ),
          }}
          disabled={!state.installedSnap}
          fullWidth={true}
        />
        <Notice>
          <p>
            Please note that this is an early preview and still under heavy
            development.
          </p>
        </Notice>
      </CardContainer>
    </Container>
  );
};

export default Index;
