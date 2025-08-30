use anchor_lang::prelude::*;
use anchor_spl::token_interface::TransferChecked;

declare_id!("965BxygGCearNwucNBTsnhNVTa6SGhKtwNoopbtGQjQp");

pub mod events;
pub mod instructions;

pub use events::*;
pub use instructions::*;

#[error_code]
pub enum LockError {
    #[msg("You are not authorized to unlock tokens.")]
    Unauthorized,
}

#[program]
pub mod lock_and_unlock {
    use anchor_spl::token_interface;

    use super::*;

    // both initialize and unlock will be called by the same nodejs process
    pub fn initialize_accounts(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.data_account.bump_pool_authority = ctx.bumps.pool_authority;
        ctx.accounts.data_account.bump_data_account = ctx.bumps.data_account;
        ctx.accounts.data_account.owner = *ctx.accounts.signer.key;
        Ok(())
    }

    pub fn lock_and_emit(ctx: Context<Lock>, amount: u64, eth_address: String) -> Result<()> {
        let decimals = ctx.accounts.mint.decimals;
        let cpi_accounts = TransferChecked {
            mint: ctx.accounts.mint.to_account_info(),
            from: ctx.accounts.sender_token_account.to_account_info(),
            to: ctx
                .accounts
                .token_account_which_locks_tokens
                .to_account_info(),
            authority: ctx.accounts.signer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
        token_interface::transfer_checked(cpi_context, amount, decimals)?;
        emit!(LockEvent {
            locker: *ctx.accounts.signer.key,
            amount,
            eth_address
        });
        Ok(())
    }

    pub fn unlock(ctx: Context<Unlock>, amount: u64) -> Result<()> {
        require_keys_eq!(
            ctx.accounts.signer.key(),
            ctx.accounts.data_account.owner.key(),
            LockError::Unauthorized
        );
        let signer_seeds: &[&[&[u8]]] = &[&[b"pool_authority", &[ctx.bumps.pool_authority]]];
        let decimals = ctx.accounts.mint.decimals;
        let cpi_accounts = TransferChecked {
            mint: ctx.accounts.mint.to_account_info(),
            from: ctx
                .accounts
                .token_account_which_locks_tokens
                .to_account_info(),
            to: ctx.accounts.recipient_token_account.to_account_info(),
            authority: ctx.accounts.pool_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(signer_seeds);
        token_interface::transfer_checked(cpi_context, amount, decimals)?;
        Ok(())
    }
}
