import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID, createAssociatedTokenAccount, createMint, getAccount, getAssociatedTokenAddress, mintTo } from "@solana/spl-token";
import { LockAndUnlock } from "../target/types/lock_and_unlock";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "chai";
import { token } from "@coral-xyz/anchor/dist/cjs/utils";

describe("lock and unlock initialize", () => {
    const provider = anchor.AnchorProvider.local();
    anchor.setProvider(provider);
    const program = anchor.workspace.lock_and_unlock as Program<LockAndUnlock>
    const payer = provider.wallet as anchor.Wallet;
    const connection = anchor.getProvider().connection
    let secondUser = Keypair.generate()

    let mintToken: anchor.web3.PublicKey;
    let poolAuthorityPda: anchor.web3.PublicKey;
    let poolAuthorityBump: number;
    let dataAccountPda: anchor.web3.PublicKey;
    let dataAccountBump: number;
    let pooltokenAccount: anchor.web3.PublicKey;
    let randomUsertokenAccount: anchor.web3.PublicKey;
    let firstUserTokenAccount: anchor.web3.PublicKey;
    let secondUserTokenAccount: anchor.web3.PublicKey;
    const randomOwner = Keypair.generate();

    before(async () => {
        let tx = await provider.connection.requestAirdrop(randomOwner.publicKey, 6 * LAMPORTS_PER_SOL);
        await connection.confirmTransaction(tx)
        let tx1 = await provider.connection.requestAirdrop(secondUser.publicKey, 6 * LAMPORTS_PER_SOL);
        await connection.confirmTransaction(tx1)
        mintToken = await createMint(
            provider.connection,
            randomOwner,
            randomOwner.publicKey,
            null,
            18
        );
        [poolAuthorityPda, poolAuthorityBump] = await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from("pool_authority")],
            program.programId
        );
        [dataAccountPda, dataAccountBump] = await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from("data_account789")],
            program.programId
        );
        pooltokenAccount = await getAssociatedTokenAddress(mintToken, poolAuthorityPda, true);
        firstUserTokenAccount = await getAssociatedTokenAddress(
            mintToken,
            payer.publicKey
        );
        secondUserTokenAccount = await getAssociatedTokenAddress(
            mintToken,
            secondUser.publicKey
        );
        randomUsertokenAccount = await getAssociatedTokenAddress(
            mintToken,
            randomOwner.publicKey
        );
    });

    it("testing initialize", async () => {
        const tx = await program.methods.initializeAccounts().accounts({
            tokenProgram: TOKEN_PROGRAM_ID,
            mint: mintToken,
        }).rpc()
        await connection.confirmTransaction(tx)
        const dataAccount = await program.account.dataAccount.fetch(dataAccountPda);
        assert(dataAccount.owner.toBase58() == payer.publicKey.toBase58(), "owner mismatch")
        assert(dataAccount.bumpPoolAuthority == poolAuthorityBump, "pda account bump mismatch")
        assert(dataAccount.bumpDataAccount == dataAccountBump, "dataaccount bump misnatch")
        // Check token account balance (should be 0)
        const tokenAcc = await getAccount(connection, pooltokenAccount);
        assert(Number(tokenAcc.amount) == 0)
    })

    it("testing lock logic", async () => {
        secondUserTokenAccount = await createAssociatedTokenAccount(
            connection,
            randomOwner,
            mintToken,
            secondUser.publicKey
        );
        await mintTo(
            connection,
            randomOwner,
            mintToken,
            secondUserTokenAccount,
            randomOwner.publicKey,
            10
        );
        let poolTokenAcc = await getAccount(connection, pooltokenAccount);
        let secondUserTokenAcc = await getAccount(connection, secondUserTokenAccount);
        assert(Number(poolTokenAcc.amount) == 0)
        assert(Number(secondUserTokenAcc.amount) == 10)
        let tx = await program.methods.lockAndEmit(new anchor.BN(3), "ethaddress").accounts({
            mint: mintToken,
            signer: secondUser.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID
        }).signers([secondUser]).rpc();
        await connection.confirmTransaction(tx)
        poolTokenAcc = await getAccount(connection, pooltokenAccount);
        secondUserTokenAcc = await getAccount(connection, secondUserTokenAccount);
        assert(Number(poolTokenAcc.amount) == 3)
        assert(Number(secondUserTokenAcc.amount) == 7)
        const parsedTx = await connection.getTransaction(tx, {
            commitment: "confirmed",
            maxSupportedTransactionVersion: 0,
        });
        const eventParser = new anchor.EventParser(program.programId, program.coder);
        let lockEvent: any = null;
        for (const evt of eventParser.parseLogs(parsedTx.meta.logMessages ?? [])) {
            if (evt.name === "lockEvent") {
                lockEvent = evt.data;
            }
        }
        assert.ok(lockEvent !== null, "LockEvent not found in logs");
        assert.equal(lockEvent.amount.toNumber(), 3);
        assert.equal(lockEvent.locker.toString(), secondUser.publicKey.toString());
        assert.equal(lockEvent.ethAddress, "ethaddress");
    })

    it("testing unlock logic", async () => {
        let poolTokenAcc = await getAccount(connection, pooltokenAccount);
        let secondUserTokenAcc = await getAccount(connection, secondUserTokenAccount);
        assert(poolTokenAcc.amount == BigInt(3))
        assert(secondUserTokenAcc.amount == BigInt(7))
        let tx = await program.methods.unlock(new anchor.BN(2)).accounts({
            mint: mintToken,
            signer: payer.payer.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            reciverSolanaAccount: randomOwner.publicKey
        }).signers([payer.payer]).rpc();
        await connection.confirmTransaction(tx)
        poolTokenAcc = await getAccount(connection, pooltokenAccount);
        secondUserTokenAcc = await getAccount(connection, secondUserTokenAccount);
        let randomUserTokenAcc = await getAccount(connection, randomUsertokenAccount);
        randomUserTokenAcc = await getAccount(connection, randomUsertokenAccount);
        assert(randomUserTokenAcc.amount == BigInt(2))
        assert(poolTokenAcc.amount == BigInt(1))
        assert(secondUserTokenAcc.amount == BigInt(7))
    })
});
