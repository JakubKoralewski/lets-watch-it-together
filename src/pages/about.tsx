import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import ProTip from 'components/ProTip';
import Link from 'components/Link';
import Copyright from 'components/Copyright';

export default function About() {
  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Next.js example
        </Typography>
        <Link href="/" color="secondary">
          <Button variant="contained" color="primary">
            Go to the main page
          </Button>
        </Link>
        <ProTip />
        <Copyright />
      </Box>
    </Container>
  );
}