import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Bridge } from "../target/types/bridge";
import { getAccount, getAssociatedTokenAddress, getMint, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
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
            recipient: secondUser.publicKey
        }).rpc()
        await connection.confirmTransaction(tx, "confirmed")
        let mintInfo = await getMint(
            provider.connection,
            mintPda,
            "confirmed",
            TOKEN_2022_PROGRAM_ID
        );
        assert(Number(mintInfo.supply) == 550)
        const userAta = await getAssociatedTokenAddress(mintPda, secondUser.publicKey, true, TOKEN_2022_PROGRAM_ID);
        const userTokenAccount = await getAccount(
            provider.connection,
            userAta,
            "confirmed",
            TOKEN_2022_PROGRAM_ID
        );
        assert(Number(userTokenAccount.amount) === 550);
    })

    it("Burn some tokens", async () => {
        let tx = await program.methods.burnFromAddress(new anchor.BN(50), "0x1eDc529e7C06856089BDf212CCd7A03d3da8dA7e").accounts({
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            signer: secondUser.publicKey
        }).signers([secondUser]).rpc()
        await connection.confirmTransaction(tx, "confirmed")
        let mintInfo = await getMint(
            provider.connection,
            mintPda,
            "confirmed",
            TOKEN_2022_PROGRAM_ID
        );
        assert(Number(mintInfo.supply) == 500)
        const parsedTx = await connection.getTransaction(tx, {
            commitment: "confirmed",
            maxSupportedTransactionVersion: 0,
        });
        const eventParser = new anchor.EventParser(program.programId, program.coder);
        let burnEvent: any = null;
        for (const evt of eventParser.parseLogs(parsedTx.meta.logMessages ?? [])) {
            if (evt.name === "burnEvent") {
                burnEvent = evt.data;
            }
        }
        assert.ok(burnEvent !== null, "BurnEvent not found in logs");
        assert.equal(burnEvent.amount.toNumber(), 50);
        assert.equal(burnEvent.burner.toString(), secondUser.publicKey.toString());
        assert.equal(burnEvent.ethAddress, "0x1eDc529e7C06856089BDf212CCd7A03d3da8dA7e");
    })
})
