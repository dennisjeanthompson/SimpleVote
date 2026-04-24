import { useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Container,
  CssBaseline,
  Grid,
  IconButton,
  Stack,
  TextField,
  Toolbar,
  Typography,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contract';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

function App() {
  const [account, setAccount] = useState('');
  const [networkName, setNetworkName] = useState('');
  const [status, setStatus] = useState('Ready to connect your wallet.');
  const [proposalText, setProposalText] = useState('');
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);

  const contractInfo = useMemo(
    () => ({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI }),
    []
  );

  const hasMetaMask = typeof window.ethereum !== 'undefined';

  const getProvider = () => {
    return new ethers.BrowserProvider(window.ethereum);
  };

  const getContract = async (withSigner = false) => {
    const provider = getProvider();
    const signer = withSigner ? await provider.getSigner() : provider;
    return new ethers.Contract(contractInfo.address, contractInfo.abi, signer);
  };

  const requestAccount = async () => {
    if (!hasMetaMask) {
      setStatus('MetaMask not found. Install MetaMask and try again.');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setStatus('Wallet connected. Loading proposals...');
    } catch (error) {
      setStatus('Wallet connection cancelled.');
    }
  };

  const loadNetwork = async () => {
    if (!hasMetaMask) return;
    try {
      const provider = getProvider();
      const network = await provider.getNetwork();
      setNetworkName(network.name || `chain-${network.chainId}`);
    } catch (error) {
      setNetworkName('unknown');
    }
  };

  const loadProposals = async () => {
    if (!hasMetaMask) {
      setStatus('Install MetaMask to use the voting app.');
      return;
    }
    if (contractInfo.address === ZERO_ADDRESS) {
      setStatus('Update frontend/.env with the deployed contract address.');
      return;
    }

    setLoading(true);
    try {
      const contract = await getContract();
      const proposalCount = await contract.getProposalCount();
      const count = Number(proposalCount.toString());
      const rawProposals = await Promise.all(
        Array.from({ length: count }, (_, index) => contract.getProposal(index))
      );
      const votedStatuses = await Promise.all(
        Array.from({ length: count }, (_, index) => contract.hasVoted(index, account || ethers.ZeroAddress))
      );

      setProposals(
        rawProposals.map(([description, voteCount], index) => ({
          id: index,
          description,
          votes: Number(voteCount.toString()),
          hasVoted: Boolean(votedStatuses[index]),
        }))
      );
      setStatus('Proposals loaded successfully.');
    } catch (error) {
      console.error(error);
      setStatus('Unable to load proposals. Verify the contract address and network.');
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProposal = async () => {
    if (!proposalText.trim()) {
      setStatus('Enter a proposal description before creating.');
      return;
    }
    if (!account) {
      setStatus('Connect your wallet first.');
      return;
    }
    if (contractInfo.address === ZERO_ADDRESS) {
      setStatus('Update frontend/.env with the deployed contract address.');
      return;
    }

    setLoading(true);
    try {
      const contract = await getContract(true);
      const tx = await contract.createProposal(proposalText.trim());
      setStatus('Transaction sent, waiting for confirmation...');
      await tx.wait();
      setProposalText('');
      setStatus('Proposal created successfully! Reloading proposals...');
      await loadProposals();
    } catch (error) {
      console.error(error);
      setStatus('Failed to create proposal. Please check your wallet and network.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proposalId) => {
    if (!account) {
      setStatus('Connect your wallet to vote.');
      return;
    }
    if (contractInfo.address === ZERO_ADDRESS) {
      setStatus('Update frontend/.env with the deployed contract address.');
      return;
    }

    setLoading(true);
    try {
      const contract = await getContract(true);
      const tx = await contract.vote(proposalId);
      setStatus('Vote transaction sent, waiting for confirmation...');
      await tx.wait();
      setStatus('Vote cast successfully! Reloading proposals...');
      await loadProposals();
    } catch (error) {
      console.error(error);
      const message = error?.data?.message || error?.message || 'Vote failed. Check your wallet and network.';
      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNetwork();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || '');
        setStatus(accounts.length ? 'Account changed. Reloading proposals...' : 'Wallet disconnected.');
        if (accounts.length) loadProposals();
      });
      window.ethereum.on('chainChanged', () => {
        loadNetwork();
        setStatus('Network changed. Reloading proposals...');
        loadProposals();
      });
    }
  }, []);

  useEffect(() => {
    if (account) loadProposals();
  }, [account]);

  return (
    <>
      <CssBaseline />
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Simple DAO Voting
          </Typography>
          <Button color="inherit" onClick={requestAccount}>
            {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Stack spacing={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Voting dashboard
              </Typography>
              <Typography sx={{ mb: 2 }} color="text.secondary">
                Create a proposal or vote on existing governance items. This interface uses your browser wallet and the deployed voting contract.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <TextField
                  value={proposalText}
                  onChange={(event) => setProposalText(event.target.value)}
                  label="New proposal"
                  placeholder="Add a proposal description"
                  fullWidth
                  disabled={loading}
                />
                <Button variant="contained" size="large" onClick={handleCreateProposal} disabled={loading}>
                  Create Proposal
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" alignItems="center">
                <Chip label={`Network: ${networkName || 'unknown'}`} color="secondary" />
                <Chip
                  label={contractInfo.address === ZERO_ADDRESS ? 'Contract not configured' : `Contract: ${contractInfo.address.slice(0, 6)}...${contractInfo.address.slice(-4)}`}
                  variant="outlined"
                />
              </Stack>
            </CardContent>
            <CardActions>
              <Button startIcon={<RefreshIcon />} onClick={loadProposals} disabled={loading}>
                Refresh
              </Button>
            </CardActions>
          </Card>

          {status && <Alert severity="info">{status}</Alert>}
          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" my={2}>
              <CircularProgress />
            </Box>
          )}

          <Grid container spacing={3}>
            {proposals.length ? (
              proposals.map((proposal) => (
                <Grid item xs={12} md={6} key={proposal.id}>
                  <Card elevation={2} sx={{ minHeight: 220, display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                        <Typography variant="h6">Proposal #{proposal.id + 1}</Typography>
                        <Chip
                          label={proposal.hasVoted ? 'Already voted' : 'Not voted yet'}
                          color={proposal.hasVoted ? 'success' : 'default'}
                          size="small"
                        />
                      </Stack>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {proposal.description}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 600 }}>
                        Votes: {proposal.votes}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleVote(proposal.id)}
                        disabled={proposal.hasVoted || loading}
                      >
                        Vote
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Card elevation={1} sx={{ py: 4, textAlign: 'center' }}>
                  <CardContent>
                    <Typography variant="h6">No proposals found</Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                      Create the first proposal and refresh to start voting.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Stack>
      </Container>
    </>
  );
}

export default App;
