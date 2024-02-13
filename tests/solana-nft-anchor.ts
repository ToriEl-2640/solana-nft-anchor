import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaNftAnchor } from "../target/types/solana_nft_anchor";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import {
  findMasterEditionPda,
  findMetadataPda,
  mplTokenMetadata,
  MPL_TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createGenericFile, publicKey } from "@metaplex-foundation/umi";

import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

describe("solana-nft-anchor", async () => {
  // Configured the client to use the devnet cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.SolanaNftAnchor as Program<SolanaNftAnchor>;

  const signer = provider.wallet;

  const umi = createUmi ("https://api.devnet.solana.com");
  umi.use(nftStorageUploader({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDVCNmJkNDM2MUQ1MkIyRTYxYTg5MWU3QWI1MEY4OGJFYTlEQmRjQTAiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcwNzg1NzkzNzczMCwibmFtZSI6ImNhbHlwIn0.dW4hkh1ifNLg8W00u9rVHmDN7tT8y80d3mZn7UtdJgo" }));


const imageBuffer = readFileSync('/home/toriel/nft-storage-quickstart/dog.jpg')
async function uploader() {
  const [imageUri] = await umi.uploader.upload([
    createGenericFile(imageBuffer, "dog.jpg"),
  ]);

  // Upload the JSON metadata.
  const uri = await umi.uploader.uploadJson({
    name: 'NFT #1',
    description: 'description 1',
    image: imageUri,
  })
  console.log("uri", uri);
}

uploader();
  
  //("https://api.devnet.solana.com")
   // .use(walletAdapterIdentity(signer))
    //.use(mplTokenMetadata());

    // generate the mint account
  const mint = anchor.web3.Keypair.generate();

  // Derive the associated token address account for the mint
  const associatedTokenAccount = await getAssociatedTokenAddress(
    mint.publicKey,
    signer.publicKey
  );

  // derive the metadata account
  let metadataAccount = findMetadataPda(umi, {
    mint: publicKey(mint.publicKey),
  })[0];

  //derive the master edition pda
  let masterEditionAccount = findMasterEditionPda(umi, {
    mint: publicKey(mint.publicKey),
  })[0];

  const metadata = {
    name: "Kobeni",
    symbol: "kBN",
    uri: "https://raw.githubusercontent.com/687c/solana-nft-native-client/main/metadata.json",
  };

  it("mints nft!", async () => {
    const tx = await program.methods
      .initNft(metadata.name, metadata.symbol, metadata.uri)
      .accounts({
        signer: provider.publicKey,
        mint: mint.publicKey,
        associatedTokenAccount,
        metadataAccount,
        masterEditionAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([mint])
      .rpc();

    console.log(
      `mint nft tx: https://explorer.solana.com/tx/${tx}?cluster=devnet`
    );
    console.log(
      `minted nft: https://explorer.solana.com/address/${mint.publicKey}?cluster=devnet`
    );
  });
});
export { SolanaNftAnchor };

  function readFileSync(arg0: string) {
    throw new Error("Function not implemented.");
  }

function nftStorageUploader(arg0: { token: string; }): import("@metaplex-foundation/umi").UmiPlugin {
  throw new Error("Function not implemented.");
}

