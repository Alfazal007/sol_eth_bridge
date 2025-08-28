import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Bridge } from "../target/types/bridge";
import { getMint, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { assert } from "chai";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

let secondUser = Keypair.generate()
const program = anchor.workspace.bridge as Program<Bridge>;
const signer = provider.wallet.publicKey;
let mintPda: anchor.web3.PublicKey;
let bump: number;
const connection = anchor.getProvider().connection

describe("bridge", () => {
    before(async () => {
        [mintPda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("mint"), signer.toBuffer()],
            program.programId
        )
        const tx = await connection.requestAirdrop(secondUser.publicKey, 5 * LAMPORTS_PER_SOL)
        await connection.confirmTransaction(tx, "confirmed")
    })

    it("Initializes the mint!", async () => {
        let tx = await program.methods
            .initialize()
            .accounts({
                signer,
                tokenProgram: TOKEN_2022_PROGRAM_ID,
            })
            .rpc();
        await connection.confirmTransaction(tx, "confirmed")
        const mintInfo = await getMint(
            provider.connection,
            mintPda,
            "confirmed",
            TOKEN_2022_PROGRAM_ID
        );
        assert(Number(mintInfo.supply) == 0)
    })

    it("Mint some tokens", async () => {
        let tx = await program.methods.mintToAddress(new anchor.BN(550)).accounts({
            tokenProgram: TOKEN_2022_PROGRAM_ID,
        }).rpc()
        await connection.confirmTransaction(tx, "confirmed")
        let mintInfo = await getMint(
            provider.connection,
            mintPda,
            "confirmed",
            TOKEN_2022_PROGRAM_ID
        );
        assert(Number(mintInfo.supply) == 550)
    })
})
