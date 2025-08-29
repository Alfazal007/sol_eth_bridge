use anchor_lang::prelude::*;
use anchor_spl::token_interface::Burn;
use anchor_spl::token_interface::MintTo;

pub mod instructions;
pub use instructions::*;

pub mod events;
pub use events::*;

declare_id!("FuRZXPZZEhdtgtNw2m5aHgmjRxHJEExv688maA3sGb8p");

#[program]
pub mod bridge {

    use anchor_spl::token_interface;

    use super::*;

    pub fn initialize(ctx: Context<InitializeMintAccount>) -> Result<()> {
        ctx.accounts.data_account.bump_mint = ctx.bumps.mint;
        ctx.accounts.data_account.bump_data_account = ctx.bumps.data_account;
        ctx.accounts.data_account.owner = *ctx.accounts.signer.key;
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

    pub fn burn_from_address(
        ctx: Context<BurnTokenFromAddress>,
        amount: u64,
        eth_address: String,
    ) -> Result<()> {
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"mint",
            ctx.accounts.data_account.owner.as_ref(),
            &[ctx.accounts.data_account.bump_mint],
        ]];
        let cpi_accounts = Burn {
            mint: ctx.accounts.mint.to_account_info(),
            from: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.signer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(signer_seeds);
        token_interface::burn(cpi_context, amount)?;
        emit!(BurnEvent {
            burner: *ctx.accounts.signer.key,
            amount,
            eth_address
        });
        Ok(())
    }
}
