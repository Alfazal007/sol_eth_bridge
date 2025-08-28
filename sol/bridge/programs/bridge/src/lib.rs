use anchor_lang::prelude::*;
use anchor_spl::token_interface::MintTo;

pub mod instructions;
pub use instructions::*;

declare_id!("FuRZXPZZEhdtgtNw2m5aHgmjRxHJEExv688maA3sGb8p");

#[program]
pub mod bridge {

    use anchor_spl::token_interface;

    use super::*;

    pub fn initialize(ctx: Context<InitializeMintAccount>) -> Result<()> {
        ctx.accounts.data_account.bump_mint = ctx.bumps.mint;
        ctx.accounts.data_account.bump_data_account = ctx.bumps.data_account;
        Ok(())
    }

    pub fn mint_to_address(ctx: Context<MintTokenToAddress>, amount: u64) -> Result<()> {
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"mint",
            ctx.accounts.signer.key.as_ref(),
            &[ctx.accounts.data_account.bump_mint],
        ]];
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.mint.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(signer_seeds);
        token_interface::mint_to(cpi_context, amount)?;
        Ok(())
    }
}
