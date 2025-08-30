import * as anchor from "@coral-xyz/anchor"
import { Program } from "@coral-xyz/anchor"
import { TOKEN_PROGRAM_ID, createMint, getAssociatedTokenAddress } from "@solana/spl-token"
import { LockAndUnlock } from "../target/types/lock_and_unlock";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

describe("lock and unlock initialize", () => {
    const provider = anchor.AnchorProvider.local()
    anchor.setProvider(provider)
    const program = anchor.workspace.Bridge as Program<LockAndUnlock>
    const payer = provider.wallet as anchor.Wallet
    let mintToken: anchor.web3.PublicKey
    let lockerAta: anchor.web3.PublicKey
    const secondUser = anchor.web3.Keypair.generate()
    let secondUserTokenAta: anchor.web3.PublicKey
    let firstUserTokenAta: anchor.web3.PublicKey
    let connection = anchor.getProvider().connection

    before(async () => {
        /*
        const randomOwner = Keypair.generate()
        await connection.requestAirdrop(randomOwner.publicKey, 6 * LAMPORTS_PER_SOL)
        const tx = await connection.requestAirdrop(secondUser.publicKey, 6 * 1000000000)
        await connection.confirmTransaction(tx)
        mintToken = await createMint(
            provider.connection,
            randomOwner,
            randomOwner.publicKey,
            null,
            18,
        );
                const [lockAuthorityPda, lockAuthorityBump] = await anchor.web3.PublicKey.findProgramAddress(
                    [Buffer.from("token_account"), payer.payer.publicKey.toBuffer()],
                    program.programId
                )
                lockerAta = await getAssociatedTokenAddress(
                    mintToken,
                    lockAuthorityPda,
                    true,
                    TOKEN_PROGRAM_ID
                )
                firstUserTokenAta = await getAssociatedTokenAddress(
                    mintToken,
                    payer.publicKey,
                    false,
                    TOKEN_PROGRAM_ID
                )
                secondUserTokenAta = await getAssociatedTokenAddress(
                    mintToken,
                    secondUser.publicKey,
                    false,
                    TOKEN_PROGRAM_ID
                )
                console.log("got all data")
                */
    })

    it("testing initialize", async () => {
        const tx = await program.methods.initialize().accounts({
            tokenProgram: TOKEN_PROGRAM_ID,
        }).rpc()
        await connection.confirmTransaction(tx)
    })
})
